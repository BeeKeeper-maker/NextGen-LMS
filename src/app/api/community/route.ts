import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    const postWhere = tenantId ? { tenantId } : {};
    const categoryWhere = tenantId ? { tenantId } : {};

    const posts = await db.communityPost.findMany({
      where: postWhere,
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, role: true },
        },
        category: true,
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        reactions: true,
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 20,
    });

    const categories = await db.communityCategory.findMany({
      where: categoryWhere,
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json({ posts, categories });
  } catch (error) {
    console.error('Community fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch community data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, authorId, title, content, type, categoryId, tags } = body;

    const post = await db.communityPost.create({
      data: {
        tenantId,
        authorId,
        title,
        content,
        type: type || 'discussion',
        categoryId,
        tags: tags ? tags.join(',') : null,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, role: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Community post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
