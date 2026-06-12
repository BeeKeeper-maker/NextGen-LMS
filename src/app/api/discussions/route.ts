import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/discussions?lessonId=xxx&courseId=yyy&tenantId=zzz - Get lesson discussions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    const courseId = searchParams.get('courseId');
    const tenantId = searchParams.get('tenantId');

    // Build where clause
    const where: Record<string, unknown> = {};

    // If tenantId is provided, find all lesson IDs belonging to courses in that tenant
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

      if (lessonId) {
        // Verify the requested lessonId belongs to the tenant
        if (!tenantLessonIds.includes(lessonId)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        where.lessonId = lessonId;
      } else if (courseId) {
        // Get all lessons for the course, then intersect with tenant lessons
        const course = await db.course.findUnique({
          where: { id: courseId },
          include: {
            modules: {
              include: { lessons: { select: { id: true } } },
            },
          },
        });

        if (!course) {
          return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        if (course.tenantId !== tenantId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const courseLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
        where.lessonId = { in: courseLessonIds };
      } else {
        // No lessonId or courseId, filter by all tenant lessons
        where.lessonId = { in: tenantLessonIds };
      }
    } else {
      // No tenantId filter - original behavior
      if (lessonId) {
        where.lessonId = lessonId;
      } else if (courseId) {
        const course = await db.course.findUnique({
          where: { id: courseId },
          include: {
            modules: {
              include: { lessons: { select: { id: true } } },
            },
          },
        });

        if (!course) {
          return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
        where.lessonId = { in: lessonIds };
      }
    }

    const discussions = await db.lessonDiscussion.findMany({
      where,
      include: {
        lesson: {
          select: { id: true, title: true, module: { select: { id: true, title: true } } },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 100,
    });

    return NextResponse.json({ discussions });
  } catch (error) {
    console.error('Discussions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
  }
}

// POST /api/discussions - Create a new lesson discussion / reply
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lessonId, userId, content, parentId, isPinned } = body;

    if (!lessonId || !userId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: lessonId, userId, content' },
        { status: 400 }
      );
    }

    // Verify lesson exists
    const lesson = await db.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // If parentId is provided, verify parent exists
    if (parentId) {
      const parent = await db.lessonDiscussion.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: 'Parent discussion not found' }, { status: 404 });
      }
    }

    const discussion = await db.lessonDiscussion.create({
      data: {
        lessonId,
        userId,
        content,
        parentId: parentId || null,
        isPinned: isPinned || false,
      },
      include: {
        lesson: {
          select: { id: true, title: true, module: { select: { id: true, title: true } } },
        },
      },
    });

    return NextResponse.json(discussion, { status: 201 });
  } catch (error) {
    console.error('Discussion creation error:', error);
    return NextResponse.json({ error: 'Failed to create discussion' }, { status: 500 });
  }
}
