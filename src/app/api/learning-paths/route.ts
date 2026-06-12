import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/learning-paths?tenantId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    const where = tenantId ? { tenantId } : {};

    const paths = await db.learningPath.findMany({
      where,
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
          select: { id: true, userId: true, status: true, progress: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute derived fields for each path
    const enrichedPaths = paths.map((path) => {
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

      return {
        ...path,
        courseCount,
        enrolledCount,
        completionRate,
        estimatedDuration,
      };
    });

    return NextResponse.json(enrichedPaths);
  } catch (error) {
    console.error('Learning paths fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning paths' },
      { status: 500 }
    );
  }
}

// POST /api/learning-paths
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tenantId,
      title,
      description,
      thumbnailUrl,
      category,
      level,
      duration,
      isPublished,
      courses,
    } = body;

    if (!tenantId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, title' },
        { status: 400 }
      );
    }

    // Create the learning path with its courses
    const path = await db.learningPath.create({
      data: {
        tenantId,
        title,
        description: description || null,
        thumbnailUrl: thumbnailUrl || null,
        category: category || null,
        level: level || null,
        duration: duration || null,
        isPublished: isPublished ?? false,
        courses: courses
          ? {
              create: courses.map(
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
                  courseId: c.courseId,
                  orderIndex: c.orderIndex ?? i,
                  isRequired: c.isRequired ?? true,
                  milestone: c.milestone || null,
                  prerequisiteIds: c.prerequisiteIds || null,
                })
              ),
            }
          : undefined,
      },
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
          select: { id: true, userId: true, status: true, progress: true },
        },
      },
    });

    // Compute derived fields
    const courseCount = path.courses.length;
    const enrolledCount = path.enrollments.length;
    const estimatedDuration = path.courses.reduce(
      (sum, pc) => sum + (pc.course.durationHours || 0),
      0
    );

    return NextResponse.json(
      { ...path, courseCount, enrolledCount, completionRate: 0, estimatedDuration },
      { status: 201 }
    );
  } catch (error) {
    console.error('Learning path create error:', error);
    return NextResponse.json(
      { error: 'Failed to create learning path' },
      { status: 500 }
    );
  }
}
