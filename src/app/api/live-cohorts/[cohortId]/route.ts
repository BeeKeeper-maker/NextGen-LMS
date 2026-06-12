import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/live-cohorts/[cohortId] - Get a single live cohort
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cohortId: string }> }
) {
  try {
    const { cohortId } = await params;

    const cohort = await db.liveCohort.findUnique({
      where: { id: cohortId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            category: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!cohort) {
      return NextResponse.json({ error: 'Live cohort not found' }, { status: 404 });
    }

    const event = {
      id: cohort.id,
      title: cohort.title,
      description: cohort.description,
      type: cohort.category || 'live_session',
      startDate: cohort.startDate.toISOString(),
      endDate: cohort.endDate.toISOString(),
      courseId: cohort.courseId,
      instructorName: cohort.instructorName || cohort.instructor?.name || undefined,
      meetingUrl: cohort.meetingUrl,
      color: cohort.color,
      attendees: cohort.enrolledCount,
      maxAttendees: cohort.capacity,
      status: cohort.status,
      location: cohort.location,
      createdAt: cohort.createdAt.toISOString(),
      updatedAt: cohort.updatedAt.toISOString(),
    };

    return NextResponse.json(event);
  } catch (error) {
    console.error('Live cohort fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch live cohort' }, { status: 500 });
  }
}

// PUT /api/live-cohorts/[cohortId] - Update a live cohort
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ cohortId: string }> }
) {
  try {
    const { cohortId } = await params;
    const body = await request.json();

    const existing = await db.liveCohort.findUnique({ where: { id: cohortId } });
    if (!existing) {
      return NextResponse.json({ error: 'Live cohort not found' }, { status: 404 });
    }

    // Verify tenantId if provided (from body or query param)
    const { searchParams } = new URL(request.url);
    const tenantId = body.tenantId || searchParams.get('tenantId');
    if (tenantId && existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description || null;
    if (body.courseId !== undefined) data.courseId = body.courseId || null;
    if (body.instructorId !== undefined) data.instructorId = body.instructorId || null;
    if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) data.endDate = new Date(body.endDate);
    if (body.location !== undefined) data.location = body.location || null;
    if (body.meetingUrl !== undefined) data.meetingUrl = body.meetingUrl || null;
    if (body.capacity !== undefined) data.capacity = body.capacity;
    if (body.enrolledCount !== undefined) data.enrolledCount = body.enrolledCount;
    if (body.status !== undefined) data.status = body.status;
    if (body.category !== undefined) data.category = body.category;
    if (body.color !== undefined) data.color = body.color;
    if (body.instructorName !== undefined) data.instructorName = body.instructorName || null;

    const cohort = await db.liveCohort.update({
      where: { id: cohortId },
      data,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            category: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    const event = {
      id: cohort.id,
      title: cohort.title,
      description: cohort.description,
      type: cohort.category || 'live_session',
      startDate: cohort.startDate.toISOString(),
      endDate: cohort.endDate.toISOString(),
      courseId: cohort.courseId,
      instructorName: cohort.instructorName || cohort.instructor?.name || undefined,
      meetingUrl: cohort.meetingUrl,
      color: cohort.color,
      attendees: cohort.enrolledCount,
      maxAttendees: cohort.capacity,
      status: cohort.status,
      location: cohort.location,
      createdAt: cohort.createdAt.toISOString(),
      updatedAt: cohort.updatedAt.toISOString(),
    };

    return NextResponse.json(event);
  } catch (error) {
    console.error('Live cohort update error:', error);
    return NextResponse.json({ error: 'Failed to update live cohort' }, { status: 500 });
  }
}

// DELETE /api/live-cohorts/[cohortId] - Delete a live cohort
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ cohortId: string }> }
) {
  try {
    const { cohortId } = await params;

    const existing = await db.liveCohort.findUnique({ where: { id: cohortId } });
    if (!existing) {
      return NextResponse.json({ error: 'Live cohort not found' }, { status: 404 });
    }

    // Verify tenantId if provided
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    if (tenantId && existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.liveCohort.delete({ where: { id: cohortId } });

    return NextResponse.json({ success: true, id: cohortId });
  } catch (error) {
    console.error('Live cohort delete error:', error);
    return NextResponse.json({ error: 'Failed to delete live cohort' }, { status: 500 });
  }
}
