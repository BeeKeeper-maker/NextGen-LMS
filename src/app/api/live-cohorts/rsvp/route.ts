import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/live-cohorts/rsvp?userId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const rsvps = await db.liveCohortRSVP.findMany({
      where: { userId, status: { not: 'cancelled' } },
      include: {
        cohort: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rsvps);
  } catch (error) {
    console.error('RSVP fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch RSVPs' }, { status: 500 });
  }
}

// POST /api/live-cohorts/rsvp - Create or update RSVP
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cohortId, userId, tenantId, status } = body;

    if (!cohortId || !userId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields: cohortId, userId, tenantId' },
        { status: 400 }
      );
    }

    const rsvpStatus = status || 'going';

    // Upsert: create or update the RSVP
    const rsvp = await db.liveCohortRSVP.upsert({
      where: {
        cohortId_userId: { cohortId, userId },
      },
      create: {
        cohortId,
        userId,
        tenantId,
        status: rsvpStatus,
      },
      update: {
        status: rsvpStatus,
      },
    });

    // Update enrolled count on the cohort
    const goingCount = await db.liveCohortRSVP.count({
      where: { cohortId, status: 'going' },
    });

    await db.liveCohort.update({
      where: { id: cohortId },
      data: { enrolledCount: goingCount },
    });

    return NextResponse.json(rsvp, { status: 201 });
  } catch (error) {
    console.error('RSVP create/update error:', error);
    return NextResponse.json({ error: 'Failed to create/update RSVP' }, { status: 500 });
  }
}

// DELETE /api/live-cohorts/rsvp - Cancel RSVP
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cohortId = searchParams.get('cohortId');
    const userId = searchParams.get('userId');

    if (!cohortId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: cohortId, userId' },
        { status: 400 }
      );
    }

    // Check if RSVP exists first
    const existing = await db.liveCohortRSVP.findUnique({
      where: { cohortId_userId: { cohortId, userId } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
    }

    // Mark as cancelled instead of deleting
    const rsvp = await db.liveCohortRSVP.update({
      where: { cohortId_userId: { cohortId, userId } },
      data: { status: 'cancelled' },
    });

    // Update enrolled count on the cohort
    const goingCount = await db.liveCohortRSVP.count({
      where: { cohortId, status: 'going' },
    });

    await db.liveCohort.update({
      where: { id: cohortId },
      data: { enrolledCount: goingCount },
    });

    return NextResponse.json(rsvp);
  } catch (error) {
    console.error('RSVP cancel error:', error);
    return NextResponse.json({ error: 'Failed to cancel RSVP' }, { status: 500 });
  }
}
