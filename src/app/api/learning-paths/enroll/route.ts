import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/learning-paths/enroll - Enroll a user in a learning path
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { learningPathId, userId, tenantId } = body;

    if (!learningPathId || !userId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields: learningPathId, userId, tenantId' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await db.learningPathEnrollment.findUnique({
      where: {
        learningPathId_userId: { learningPathId, userId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already enrolled in this learning path' },
        { status: 409 }
      );
    }

    // Verify the learning path exists and get constituent courses
    const path = await db.learningPath.findUnique({
      where: { id: learningPathId },
      include: {
        courses: {
          select: { courseId: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!path) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      );
    }

    // Verify the path belongs to the tenant
    if (path.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const enrollment = await db.learningPathEnrollment.create({
      data: {
        learningPathId,
        userId,
        tenantId,
        status: 'active',
        progress: 0,
      },
    });

    // Auto-enroll the user in all constituent courses of the path
    try {
      for (const pathCourse of path.courses) {
        // Check if already enrolled in this course
        const existingEnrollment = await db.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId: pathCourse.courseId } },
        });

        if (!existingEnrollment) {
          await db.$transaction(async (tx) => {
            await tx.enrollment.create({
              data: {
                userId,
                courseId: pathCourse.courseId,
                tenantId,
                status: 'active',
                progress: 0,
              },
            });

            await tx.course.update({
              where: { id: pathCourse.courseId },
              data: { enrollmentCount: { increment: 1 } },
            });
          });
        }
      }
    } catch (autoEnrollError) {
      console.error('Auto-enrollment in path courses error:', autoEnrollError);
      // Don't fail the path enrollment if course enrollment fails
    }

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error('Learning path enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in learning path' },
      { status: 500 }
    );
  }
}
