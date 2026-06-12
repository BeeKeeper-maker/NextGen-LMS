import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/courses/[courseId]/modules - List modules for a course
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const modules = await db.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Modules fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 });
  }
}

// POST /api/courses/[courseId]/modules - Create module in course
export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const body = await request.json();
    const { title, description, orderIndex, isPublished } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      );
    }

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Auto-assign orderIndex if not provided
    let moduleOrderIndex = orderIndex;
    if (moduleOrderIndex === undefined || moduleOrderIndex === null) {
      const maxOrder = await db.module.aggregate({
        where: { courseId },
        _max: { orderIndex: true },
      });
      moduleOrderIndex = (maxOrder._max.orderIndex ?? -1) + 1;
    }

    const newModule = await db.module.create({
      data: {
        courseId,
        title,
        description,
        orderIndex: moduleOrderIndex,
        isPublished: isPublished ?? false,
      },
      include: {
        lessons: { orderBy: { orderIndex: 'asc' } },
      },
    });

    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error('Module creation error:', error);
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
  }
}
