import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    const where = tenantId ? { tenantId } : {};

    const courses = await db.course.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Courses fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tenantId,
      title,
      slug,
      description,
      thumbnailUrl,
      coverImageUrl,
      category,
      level,
      language,
      durationHours,
      price,
      compareAtPrice,
      isPublished,
      isFeatured,
      certificateTemplateId,
    } = body;

    if (!tenantId || !title || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, title, slug' },
        { status: 400 }
      );
    }

    const course = await db.course.create({
      data: {
        tenantId,
        title,
        slug,
        description: description || null,
        thumbnailUrl: thumbnailUrl || null,
        coverImageUrl: coverImageUrl || null,
        category: category || null,
        level: level || 'beginner',
        language: language || 'en',
        durationHours: durationHours || null,
        price: price || 0,
        compareAtPrice: compareAtPrice || null,
        isPublished: isPublished ?? false,
        isFeatured: isFeatured ?? false,
        certificateTemplateId: certificateTemplateId || null,
      },
      include: {
        modules: {
          include: {
            lessons: { orderBy: { orderIndex: 'asc' } },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Course create error:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
