import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Course fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const body = await request.json();

    const course = await db.course.update({
      where: { id: courseId },
      data: body,
      include: {
        modules: {
          include: {
            lessons: { orderBy: { orderIndex: 'asc' } },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Course update error:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    await db.course.delete({ where: { id: courseId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Course delete error:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
