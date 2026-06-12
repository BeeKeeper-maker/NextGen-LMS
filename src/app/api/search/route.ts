import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const tenantId = searchParams.get('tenantId');

    if (!query || query.length < 2) {
      return NextResponse.json({ courses: [], posts: [], assessments: [] });
    }

    const searchCondition = `%${query}%`;

    // Search courses
    const courses = await db.course.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        level: true,
        price: true,
        isPublished: true,
        enrollmentCount: true,
        avgRating: true,
        slug: true,
        thumbnailUrl: true,
      },
      take: 8,
    });

    // Search community posts
    const posts = await db.communityPost.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        likeCount: true,
        commentCount: true,
        createdAt: true,
        author: {
          select: { id: true, name: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
      take: 8,
    });

    // Search assessments
    const assessments = await db.assessment.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        isPublished: true,
        passingScore: true,
        course: {
          select: { id: true, title: true },
        },
      },
      take: 8,
    });

    return NextResponse.json({ courses, posts, assessments });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
