import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/community/reviews/[reviewId] - Moderate a review (approve, reject, flag, respond)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;
    const body = await request.json();
    const { action, reason, adminResponse, adminName } = body;

    const existing = await db.courseReview.findUnique({
      where: { id: reviewId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Parse existing moderation history
    let moderationHistory: Array<{ action: string; by: string; date: string; reason?: string }> = [];
    if (existing.moderationHistory) {
      try {
        moderationHistory = JSON.parse(existing.moderationHistory);
      } catch {
        moderationHistory = [];
      }
    }

    const updateData: Record<string, unknown> = {};

    if (action === 'approved') {
      updateData.status = 'approved';
      updateData.flagged = false;
      moderationHistory.push({
        action: 'Approved',
        by: adminName || 'Admin',
        date: new Date().toISOString().split('T')[0],
      });
    } else if (action === 'rejected') {
      updateData.status = 'rejected';
      updateData.flagged = false;
      moderationHistory.push({
        action: 'Rejected',
        by: adminName || 'Admin',
        date: new Date().toISOString().split('T')[0],
        reason: reason || 'Inappropriate',
      });
    } else if (action === 'flagged') {
      updateData.status = 'flagged';
      updateData.flagged = true;
      updateData.flagReason = reason || 'Flagged by admin';
      moderationHistory.push({
        action: 'Flagged',
        by: adminName || 'Admin',
        date: new Date().toISOString().split('T')[0],
        reason: reason || 'Flagged by admin',
      });
    } else if (action === 'respond') {
      updateData.adminResponse = adminResponse;
    } else {
      return NextResponse.json({ error: 'Invalid action. Use: approved, rejected, flagged, or respond' }, { status: 400 });
    }

    updateData.moderationHistory = JSON.stringify(moderationHistory);

    const review = await db.courseReview.update({
      where: { id: reviewId },
      data: updateData,
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
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Review moderation error:', error);
    return NextResponse.json({ error: 'Failed to moderate review' }, { status: 500 });
  }
}

// GET /api/community/reviews/[reviewId] - Get a single review
export async function GET(
  request: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;

    const review = await db.courseReview.findUnique({
      where: { id: reviewId },
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
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
}

// PUT /api/community/reviews/[reviewId] - Update a review
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;
    const body = await request.json();
    const { rating, content } = body;

    const existing = await db.courseReview.findUnique({
      where: { id: reviewId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
      }
      updateData.rating = rating;
    }
    if (content !== undefined) {
      updateData.content = content;
    }

    const review = await db.courseReview.update({
      where: { id: reviewId },
      data: updateData,
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
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

// DELETE /api/community/reviews/[reviewId] - Delete a review
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;

    const existing = await db.courseReview.findUnique({
      where: { id: reviewId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    await db.courseReview.delete({ where: { id: reviewId } });

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Review delete error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
