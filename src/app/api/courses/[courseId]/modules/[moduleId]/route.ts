import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/courses/[courseId]/modules/[moduleId] - Update module (including reorder)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;
    const body = await request.json();

    const existing = await db.module.findUnique({
      where: { id: moduleId },
    });
    if (!existing || existing.courseId !== courseId) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['title', 'description', 'orderIndex', 'isPublished'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedModule = await db.module.update({
      where: { id: moduleId },
      data: updateData,
      include: {
        lessons: { orderBy: { orderIndex: 'asc' } },
      },
    });

    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error('Module update error:', error);
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
  }
}

// DELETE /api/courses/[courseId]/modules/[moduleId] - Delete module (cascades to lessons)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;

    const existing = await db.module.findUnique({
      where: { id: moduleId },
    });
    if (!existing || existing.courseId !== courseId) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    await db.module.delete({ where: { id: moduleId } });

    return NextResponse.json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Module delete error:', error);
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });
  }
}
