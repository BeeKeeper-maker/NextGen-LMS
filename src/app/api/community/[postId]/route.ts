import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/community/[postId] - Get single post with comments and reactions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    const post = await db.communityPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, role: true },
        },
        category: true,
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        reactions: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (tenantId && post.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Increment view count
    await db.communityPost.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    });

    // Compute reaction summary
    const reactionSummary: Record<string, number> = {};
    for (const reaction of post.reactions) {
      reactionSummary[reaction.type] = (reactionSummary[reaction.type] || 0) + 1;
    }

    return NextResponse.json({ ...post, reactionSummary });
  } catch (error) {
    console.error('Community post fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PUT /api/community/[postId] - Update post
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    const existing = await db.communityPost.findUnique({ where: { id: postId } });
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (tenantId && existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['title', 'content', 'type', 'categoryId', 'tags', 'isPinned', 'isLocked'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'tags' && Array.isArray(body[field])) {
          updateData[field] = body[field].join(',');
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const post = await db.communityPost.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, role: true },
        },
        category: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Community post update error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/community/[postId] - Delete post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    const existing = await db.communityPost.findUnique({ where: { id: postId } });
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (tenantId && existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.communityPost.delete({ where: { id: postId } });

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Community post delete error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
