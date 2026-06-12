import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/slugify';

// GET /api/courses/[courseId]/modules/[moduleId]/lessons - List lessons in module
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;

    const existingModule = await db.module.findUnique({
      where: { id: moduleId },
    });
    if (!existingModule || existingModule.courseId !== courseId) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const lessons = await db.lesson.findMany({
      where: { moduleId },
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Lessons fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}

// POST /api/courses/[courseId]/modules/[moduleId]/lessons - Create lesson in module
export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      description,
      content,
      videoUrl,
      videoDuration,
      contentType,
      orderIndex,
      isPreview,
      isPublished,
      resources,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      );
    }

    const existingModule = await db.module.findUnique({
      where: { id: moduleId },
    });
    if (!existingModule || existingModule.courseId !== courseId) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const lessonSlug = slug || slugify(title);

    // Check slug uniqueness within module
    const slugExists = await db.lesson.findUnique({
      where: { moduleId_slug: { moduleId, slug: lessonSlug } },
    });
    if (slugExists) {
      return NextResponse.json(
        { error: 'A lesson with this slug already exists in this module' },
        { status: 409 }
      );
    }

    // Auto-assign orderIndex if not provided
    let lessonOrderIndex = orderIndex;
    if (lessonOrderIndex === undefined || lessonOrderIndex === null) {
      const maxOrder = await db.lesson.aggregate({
        where: { moduleId },
        _max: { orderIndex: true },
      });
      lessonOrderIndex = (maxOrder._max.orderIndex ?? -1) + 1;
    }

    const lesson = await db.lesson.create({
      data: {
        moduleId,
        title,
        slug: lessonSlug,
        description,
        content,
        videoUrl,
        videoDuration,
        contentType: contentType || 'video',
        orderIndex: lessonOrderIndex,
        isPreview: isPreview ?? false,
        isPublished: isPublished ?? false,
        resources,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Lesson creation error:', error);
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
}
