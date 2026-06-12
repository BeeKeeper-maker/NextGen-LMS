import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const COURSE_ALLOWED_FIELDS = [
  'title', 'slug', 'description', 'thumbnailUrl', 'coverImageUrl',
  'category', 'level', 'language', 'durationHours', 'price',
  'compareAtPrice', 'isPublished', 'isFeatured', 'certificateTemplateId',
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

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

    if (tenantId && course.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    // Verify course exists and belongs to tenant
    const existing = await db.course.findUnique({ where: { id: courseId } });
    if (!existing) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (tenantId && existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only allow whitelisted fields — prevents mass assignment
    const updateData: Record<string, unknown> = {};
    for (const field of COURSE_ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const course = await db.course.update({
      where: { id: courseId },
      data: updateData,
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
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    const existing = await db.course.findUnique({ where: { id: courseId } });
    if (!existing) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (tenantId && existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.course.delete({ where: { id: courseId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Course delete error:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
