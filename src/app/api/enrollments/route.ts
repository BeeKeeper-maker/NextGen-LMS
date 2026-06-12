import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

// GET /api/enrollments?userId=xxx - List user enrollments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (courseId) where.courseId = courseId;
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;

    const enrollments = await db.enrollment.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            category: true,
            level: true,
            durationHours: true,
            completionRate: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Enrollments fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}

// POST /api/enrollments - Enroll user in course
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, courseId, tenantId } = body;

    if (!userId || !courseId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, courseId, tenantId' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'User is already enrolled in this course', enrollment: existing },
        { status: 409 }
      );
    }

    // Verify course exists
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Create enrollment and increment course enrollment count
    const enrollment = await db.$transaction(async (tx) => {
      const enr = await tx.enrollment.create({
        data: {
          userId,
          courseId,
          tenantId,
          status: 'active',
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnailUrl: true,
            },
          },
        },
      });

      await tx.course.update({
        where: { id: courseId },
        data: { enrollmentCount: { increment: 1 } },
      });

      return enr;
    });

    // === FIX 5: Track enrollment analytics event ===
    try {
      await db.analyticsEvent.create({
        data: {
          tenantId,
          userId,
          eventType: 'enrollment',
          eventData: JSON.stringify({ courseId, enrollmentId: enrollment.id, source: 'direct' }),
        },
      });
      await updateDailyMetric(tenantId, 'newEnrollments', 1);
    } catch (analyticsError) {
      console.error('Enrollment analytics tracking error:', analyticsError);
    }

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error('Enrollment creation error:', error);
    return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
  }
}
