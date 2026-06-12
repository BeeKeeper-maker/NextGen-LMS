import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/courses/[courseId]/modules/[moduleId]/lessons/[lessonId] - Update lesson
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  try {
    const { courseId, moduleId, lessonId } = await params;
    const body = await request.json();

    const existing = await db.lesson.findUnique({ where: { id: lessonId } });
    if (!existing || existing.moduleId !== moduleId) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Verify the module belongs to the course
    const courseModule = await db.module.findUnique({ where: { id: moduleId } });
    if (!courseModule || courseModule.courseId !== courseId) {
      return NextResponse.json({ error: 'Module not found in this course' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'title', 'slug', 'description', 'content', 'videoUrl',
      'videoDuration', 'contentType', 'orderIndex', 'isPreview',
      'isPublished', 'resources',
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const lesson = await db.lesson.update({
      where: { id: lessonId },
      data: updateData,
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Lesson update error:', error);
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
  }
}

// DELETE /api/courses/[courseId]/modules/[moduleId]/lessons/[lessonId] - Delete lesson
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  try {
    const { courseId, moduleId, lessonId } = await params;

    const existing = await db.lesson.findUnique({ where: { id: lessonId } });
    if (!existing || existing.moduleId !== moduleId) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Verify the module belongs to the course
    const courseModule = await db.module.findUnique({ where: { id: moduleId } });
    if (!courseModule || courseModule.courseId !== courseId) {
      return NextResponse.json({ error: 'Module not found in this course' }, { status: 404 });
    }

    await db.lesson.delete({ where: { id: lessonId } });

    return NextResponse.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Lesson delete error:', error);
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
  }
}
