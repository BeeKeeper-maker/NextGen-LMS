import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    // Verify lesson exists
    const lesson = await db.lesson.findUnique({ where: { id: lessonId } });
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

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
