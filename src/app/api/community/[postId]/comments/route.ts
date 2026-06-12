import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/community/[postId]/comments - Add comment to post
export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    const { authorId, content, parentId } = body;

    if (!authorId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: authorId, content' },
        { status: 400 }
      );
    }

    // Verify post exists
    const post = await db.communityPost.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // If parentId provided, verify parent comment exists and belongs to same post
    if (parentId) {
      const parentComment = await db.communityComment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json(
          { error: 'Parent comment not found in this post' },
          { status: 404 }
        );
      }
    }

    const comment = await db.$transaction(async (tx) => {
      const c = await tx.communityComment.create({
        data: {
          postId,
          authorId,
          content,
          parentId,
        },
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true, role: true },
          },
        },
      });

      // Increment post comment count
      await tx.communityPost.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      });

      return c;
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
