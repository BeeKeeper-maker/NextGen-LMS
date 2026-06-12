import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper: recalculate course metrics after review changes
async function recalculateCourseMetrics(courseId: string) {
  const stats = await db.courseReview.aggregate({
    where: { courseId, status: 'approved' },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await db.course.update({
    where: { id: courseId },
    data: {
      avgRating: stats._avg.rating || 0,
      totalRatings: stats._count.rating || 0,
    },
  });
}

// GET /api/community/reviews - List course reviews with filtering and sorting
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const courseId = searchParams.get('courseId');
    const rating = searchParams.get('rating');
    const sort = searchParams.get('sort') || 'newest';
    const tenantId = searchParams.get('tenantId');

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;
    if (courseId) where.courseId = courseId;
    if (rating) where.rating = parseInt(rating, 10);
    if (tenantId) where.tenantId = tenantId;

    const orderBy: Record<string, string> = {};
    switch (sort) {
      case 'oldest':
        orderBy.createdAt = 'asc';
        break;
      case 'highest':
        // Sort by rating desc, then by createdAt desc
        break;
      case 'lowest':
        // Sort by rating asc, then by createdAt desc
        break;
      case 'flagged':
        // Sort flagged first
        break;
      case 'newest':
      default:
        orderBy.createdAt = 'desc';
        break;
    }

    const reviews = await db.courseReview.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            _count: { select: { enrollments: true } },
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            avgRating: true,
            totalRatings: true,
          },
        },
      },
      orderBy: sort === 'flagged'
        ? [{ flagged: 'desc' }, { createdAt: 'desc' }]
        : sort === 'highest'
          ? [{ rating: 'desc' }, { createdAt: 'desc' }]
          : sort === 'lowest'
            ? [{ rating: 'asc' }, { createdAt: 'desc' }]
            : [orderBy],
      take: 50,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/community/reviews - Create a new course review
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, courseId, authorId, rating, content } = body;

    if (!tenantId || !courseId || !authorId || !rating || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, courseId, authorId, rating, content' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const review = await db.courseReview.create({
      data: {
        tenantId,
        courseId,
        authorId,
        rating,
        content,
        status: 'pending',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            _count: { select: { enrollments: true } },
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            avgRating: true,
            totalRatings: true,
          },
        },
      },
    });

    // === FIX 4: Recalculate course review metrics after review creation ===
    await recalculateCourseMetrics(courseId);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
