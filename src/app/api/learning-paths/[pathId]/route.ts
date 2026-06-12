import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/learning-paths/[pathId]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pathId: string }> }
) {
  try {
    const { pathId } = await params;

    const path = await db.learningPath.findUnique({
      where: { id: pathId },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                level: true,
                durationHours: true,
                thumbnailUrl: true,
                category: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        enrollments: {
          select: { id: true, status: true, progress: true },
        },
      },
    });

    if (!path) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      );
    }

    const courseCount = path.courses.length;
    const enrolledCount = path.enrollments.length;
    const completedEnrollments = path.enrollments.filter(
      (e) => e.status === 'completed'
    ).length;
    const completionRate =
      enrolledCount > 0
        ? Math.round((completedEnrollments / enrolledCount) * 100)
        : 0;
    const estimatedDuration = path.courses.reduce(
      (sum, pc) => sum + (pc.course.durationHours || 0),
      0
    );

    return NextResponse.json({
      ...path,
      courseCount,
      enrolledCount,
      completionRate,
      estimatedDuration,
    });
  } catch (error) {
    console.error('Learning path fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning path' },
      { status: 500 }
    );
  }
}

// PUT /api/learning-paths/[pathId]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ pathId: string }> }
) {
  try {
    const { pathId } = await params;
    const body = await request.json();
    const {
      title,
      description,
      thumbnailUrl,
      category,
      level,
      duration,
      isPublished,
      courses,
    } = body;

    // If courses array is provided, replace all existing courses
    if (courses !== undefined) {
      // Delete existing courses first
      await db.learningPathCourse.deleteMany({
        where: { learningPathId: pathId },
      });

      // Create new courses
      if (courses.length > 0) {
        await db.learningPathCourse.createMany({
          data: courses.map(
            (
              c: {
                courseId: string;
                orderIndex?: number;
                isRequired?: boolean;
                milestone?: string;
                prerequisiteIds?: string;
              },
              i: number
            ) => ({
              learningPathId: pathId,
              courseId: c.courseId,
              orderIndex: c.orderIndex ?? i,
              isRequired: c.isRequired ?? true,
              milestone: c.milestone || null,
              prerequisiteIds: c.prerequisiteIds || null,
            })
          ),
        });
      }
    }

    // Update the path itself
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl || null;
    if (category !== undefined) updateData.category = category || null;
    if (level !== undefined) updateData.level = level || null;
    if (duration !== undefined) updateData.duration = duration || null;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const path = await db.learningPath.update({
      where: { id: pathId },
      data: updateData,
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                level: true,
                durationHours: true,
                thumbnailUrl: true,
                category: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        enrollments: {
          select: { id: true, status: true, progress: true },
        },
      },
    });

    const courseCount = path.courses.length;
    const enrolledCount = path.enrollments.length;
    const completedEnrollments = path.enrollments.filter(
      (e) => e.status === 'completed'
    ).length;
    const completionRate =
      enrolledCount > 0
        ? Math.round((completedEnrollments / enrolledCount) * 100)
        : 0;
    const estimatedDuration = path.courses.reduce(
      (sum, pc) => sum + (pc.course.durationHours || 0),
      0
    );

    return NextResponse.json({
      ...path,
      courseCount,
      enrolledCount,
      completionRate,
      estimatedDuration,
    });
  } catch (error) {
    console.error('Learning path update error:', error);
    return NextResponse.json(
      { error: 'Failed to update learning path' },
      { status: 500 }
    );
  }
}

// DELETE /api/learning-paths/[pathId]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ pathId: string }> }
) {
  try {
    const { pathId } = await params;

    // Check if path exists
    const existing = await db.learningPath.findUnique({
      where: { id: pathId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      );
    }

    // Delete the path (cascades will handle courses and enrollments)
    await db.learningPath.delete({
      where: { id: pathId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Learning path delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete learning path' },
      { status: 500 }
    );
  }
}
