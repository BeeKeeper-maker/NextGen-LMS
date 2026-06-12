import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/community/[postId]/reactions - Toggle reaction (add if not exists, remove if exists)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    const { userId, type } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type' },
        { status: 400 }
      );
    }

    const validTypes = ['like', 'love', 'celebrate', 'insightful'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid reaction type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify post exists
    const post = await db.communityPost.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if reaction already exists
    const existingReaction = await db.communityReaction.findUnique({
      where: {
        postId_userId_type: { postId, userId, type },
      },
    });

    if (existingReaction) {
      // Remove reaction (toggle off)
      await db.$transaction(async (tx) => {
        await tx.communityReaction.delete({
          where: { id: existingReaction.id },
        });

        await tx.communityPost.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        });
      });

      return NextResponse.json({
        action: 'removed',
        type,
        postId,
        userId,
      });
    } else {
      // Add reaction (toggle on)
      await db.$transaction(async (tx) => {
        await tx.communityReaction.create({
          data: { postId, userId, type },
        });

        await tx.communityPost.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        });
      });

      return NextResponse.json({
        action: 'added',
        type,
        postId,
        userId,
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Reaction toggle error:', error);
    return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 });
  }
}
