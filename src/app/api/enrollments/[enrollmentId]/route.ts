import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/enrollments/[enrollmentId] - Update enrollment progress
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await params;
    const body = await request.json();

    const existing = await db.enrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['status', 'progress', 'completedAt', 'expiresAt', 'lastAccessedAt'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // If progress is 100%, auto-complete
    if (body.progress !== undefined && body.progress >= 100) {
      updateData.progress = 100;
      updateData.status = 'completed';
      updateData.completedAt = new Date().toISOString();
    }

    // Update lastAccessedAt to now if not explicitly set
    if (!body.lastAccessedAt) {
      updateData.lastAccessedAt = new Date().toISOString();
    }

    const enrollment = await db.enrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: {
        course: {
          select: { id: true, title: true, slug: true, thumbnailUrl: true },
        },
      },
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error('Enrollment update error:', error);
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 });
  }
}

// DELETE /api/enrollments/[enrollmentId] - Withdraw from course
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await params;

    const existing = await db.enrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Delete enrollment and decrement course enrollment count
    await db.$transaction(async (tx) => {
      await tx.enrollment.delete({ where: { id: enrollmentId } });

      await tx.course.update({
        where: { id: existing.courseId },
        data: { enrollmentCount: { decrement: 1 } },
      });
    });

    return NextResponse.json({ success: true, message: 'Enrollment withdrawn successfully' });
  } catch (error) {
    console.error('Enrollment delete error:', error);
    return NextResponse.json({ error: 'Failed to withdraw from course' }, { status: 500 });
  }
}
