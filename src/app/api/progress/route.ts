import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper: update course review metrics after review changes
async function recalculateCourseMetrics(courseId: string) {
  const stats = await db.courseReview.aggregate({
    where: { courseId, status: 'approved' },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await db.course.update({
    where: { id: courseId },
    data: {
      avgRating: stats._avg.rating || 0,
      totalRatings: stats._count.rating || 0,
    },
  });
}

// Helper: update daily metrics for analytics
async function updateDailyMetric(tenantId: string, field: 'activeUsers' | 'newEnrollments' | 'completions' | 'revenue' | 'quizAttempts', increment: number = 1) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const existing = await db.dailyMetric.findUnique({
      where: { tenantId_date: { tenantId, date: today.toISOString() } },
    });

    if (existing) {
      await db.dailyMetric.update({
        where: { id: existing.id },
        data: { [field]: { increment } },
      });
    } else {
      await db.dailyMetric.create({
        data: {
          tenantId,
          date: today.toISOString(),
          [field]: increment,
        },
      });
    }
  } catch (error) {
    console.error('Daily metric update error:', error);
  }
}

// Helper: generate a unique verification code
function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 8; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CERT-${Date.now()}-${randomStr}`;
}

// Helper: check and auto-unlock achievements
async function checkAndUnlockAchievements(userId: string, tenantId: string) {
  const achievements = await db.achievement.findMany({
    where: { tenantId, isActive: true },
  });

  // Get user's current stats
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const completedLessons = await db.lessonProgress.count({
    where: { userId, status: 'completed' },
  });

  const completedCourses = await db.enrollment.count({
    where: { userId, status: 'completed' },
  });

  // Get already awarded achievement IDs
  const awardedAchievements = await db.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const awardedIds = new Set(awardedAchievements.map((a) => a.achievementId));

  for (const achievement of achievements) {
    // Skip already awarded
    if (awardedIds.has(achievement.id)) continue;

    try {
      const criteria = JSON.parse(achievement.criteria);
      let isMet = false;

      switch (criteria.type) {
        case 'lesson_complete':
          isMet = completedLessons >= (criteria.count || 0);
          break;
        case 'course_complete':
          isMet = completedCourses >= (criteria.count || 0);
          break;
        case 'points':
          isMet = user.totalPoints >= (criteria.count || 0);
          break;
        case 'streak':
          isMet = user.streakDays >= (criteria.count || 0);
          break;
        default:
          break;
      }

      if (isMet) {
        await db.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        });
        // Award achievement points
        await db.user.update({
          where: { id: userId },
          data: { totalPoints: { increment: achievement.points } },
        });
      }
    } catch {
      // Invalid criteria JSON, skip
    }
  }
}

// Helper: auto-certificate on course completion
async function autoCertificateOnCompletion(
  userId: string,
  courseId: string,
  tenantId: string,
  enrollmentId: string
) {
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { certificateTemplateId: true },
    });

    if (!course?.certificateTemplateId) return;

    // Check if certificate already awarded for this course and user
    const existingCert = await db.certificateAward.findFirst({
      where: { userId, courseId, certificateId: course.certificateTemplateId },
    });
    if (existingCert) return;

    await db.certificateAward.create({
      data: {
        userId,
        certificateId: course.certificateTemplateId,
        tenantId,
        courseId,
        enrollmentId,
        verificationCode: generateVerificationCode(),
        issuedAt: new Date(),
      },
    });

    // Award bonus points for course completion
    await db.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: 50 } },
    });

    // Track completion analytics event
    await db.analyticsEvent.create({
      data: {
        tenantId,
        userId,
        eventType: 'completion',
        eventData: JSON.stringify({ courseId, enrollmentId }),
      },
    });

    // Update daily metrics
    await updateDailyMetric(tenantId, 'completions', 1);
  } catch (error) {
    console.error('Auto-certificate error:', error);
  }
}

// GET /api/progress?userId=xxx&courseId=yyy&tenantId=zzz - Get lesson progress for user in course
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');
    const tenantId = searchParams.get('tenantId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: userId' },
        { status: 400 }
      );
    }

    // If tenantId is provided, verify the user belongs to that tenant
    if (tenantId) {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      if (user.tenantId !== tenantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // If courseId is provided, get all lesson progress for user in that course
    if (courseId) {
      const course = await db.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            include: {
              lessons: { orderBy: { orderIndex: 'asc' } },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      // Verify course belongs to tenant if tenantId is provided
      if (tenantId && course.tenantId !== tenantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

      const progress = await db.lessonProgress.findMany({
        where: {
          userId,
          lessonId: { in: lessonIds },
        },
      });

      return NextResponse.json({
        courseId,
        userId,
        totalLessons: lessonIds.length,
        completedLessons: progress.filter((p) => p.status === 'completed').length,
        inProgressLessons: progress.filter((p) => p.status === 'in_progress').length,
        progress,
      });
    }

    // If lessonId is provided, get progress for specific lesson
    if (lessonId) {
      // Verify the lesson's course belongs to tenant if tenantId is provided
      if (tenantId) {
        const lesson = await db.lesson.findUnique({
          where: { id: lessonId },
          include: { module: { include: { course: { select: { tenantId: true } } } } },
        });
        if (lesson && lesson.module.course.tenantId !== tenantId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      const progress = await db.lessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
      });

      return NextResponse.json(progress || { userId, lessonId, status: 'not_started', progressPercent: 0, timeSpent: 0 });
    }

    // Otherwise get all progress for user
    // If tenantId is provided, filter progress to only include lessons from courses in that tenant
    if (tenantId) {
      const tenantCourses = await db.course.findMany({
        where: { tenantId },
        select: {
          modules: {
            select: {
              lessons: { select: { id: true } },
            },
          },
        },
      });
      const tenantLessonIds = tenantCourses.flatMap((c) =>
        c.modules.flatMap((m) => m.lessons.map((l) => l.id))
      );

      const progress = await db.lessonProgress.findMany({
        where: {
          userId,
          lessonId: { in: tenantLessonIds },
        },
      });

      return NextResponse.json(progress);
    }

    const progress = await db.lessonProgress.findMany({
      where: { userId },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

// POST /api/progress - Update lesson progress
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, lessonId, status, progressPercent, timeSpent, lastPosition } = body;

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, lessonId' },
        { status: 400 }
      );
    }

    // Verify lesson exists and get course info
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (progressPercent !== undefined) updateData.progressPercent = progressPercent;
    if (timeSpent !== undefined) updateData.timeSpent = timeSpent;
    if (lastPosition !== undefined) updateData.lastPosition = lastPosition;

    // If completed, set completedAt
    if (status === 'completed') {
      updateData.progressPercent = 100;
      updateData.completedAt = new Date().toISOString();
    }

    const progress = await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: updateData,
      create: {
        userId,
        lessonId,
        status: status || 'in_progress',
        progressPercent: progressPercent ?? 0,
        timeSpent: timeSpent ?? 0,
        lastPosition,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      },
    });

    // === FIX 1: Gamification (Points + Streak + Achievements) ===
    if (status === 'completed') {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (user) {
        // Award 10 points for lesson completion
        await db.user.update({
          where: { id: userId },
          data: { totalPoints: { increment: 10 } },
        });

        // Update streak days
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
        let newStreak = 1;

        if (lastLogin) {
          const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
          const diffDays = Math.floor((today.getTime() - lastLoginDay.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 0) {
            // Same day - no change to streak
            newStreak = user.streakDays;
          } else if (diffDays === 1) {
            // Yesterday - increment streak
            newStreak = user.streakDays + 1;
          } else {
            // Older than yesterday - reset to 1
            newStreak = 1;
          }
        }

        await db.user.update({
          where: { id: userId },
          data: {
            streakDays: newStreak,
            lastLoginAt: now.toISOString(),
          },
        });

        // Check and auto-unlock achievements
        await checkAndUnlockAchievements(userId, user.tenantId);
      }
    }

    // === FIX 2: Auto-Certificate on Course Completion ===
    const course = lesson.module.course;

    // Find enrollment for this user and course
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });

    if (enrollment && course) {
      // Count total lessons in the course
      const courseWithModules = await db.course.findUnique({
        where: { id: course.id },
        include: {
          modules: {
            include: {
              lessons: { where: { isPublished: true } },
            },
          },
        },
      });

      if (courseWithModules) {
        const totalLessons = courseWithModules.modules.reduce(
          (acc, m) => acc + m.lessons.length,
          0
        );

        // Count completed lessons for this enrollment
        const allLessonIds = courseWithModules.modules.flatMap((m) =>
          m.lessons.map((l) => l.id)
        );

        const completedCount = await db.lessonProgress.count({
          where: {
            userId,
            lessonId: { in: allLessonIds },
            status: 'completed',
          },
        });

        // Calculate progress percentage
        const progressPct = totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0;

        // Update enrollment progress
        const updateEnrollmentData: Record<string, unknown> = {
          progress: progressPct,
          lastAccessedAt: new Date().toISOString(),
        };

        if (progressPct === 100 && enrollment.status !== 'completed') {
          updateEnrollmentData.status = 'completed';
          updateEnrollmentData.completedAt = new Date().toISOString();
        }

        await db.enrollment.update({
          where: { id: enrollment.id },
          data: updateEnrollmentData,
        });

        // If course just completed, trigger auto-certificate
        if (progressPct === 100 && enrollment.status !== 'completed') {
          await autoCertificateOnCompletion(
            userId,
            course.id,
            course.tenantId,
            enrollment.id
          );
        }
      }
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
