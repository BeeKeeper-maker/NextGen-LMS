import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/live-cohorts?tenantId=xxx&status=xxx&category=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;
    if (category) where.category = category;

    const cohorts = await db.liveCohort.findMany({
      where,
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
      orderBy: { startDate: 'asc' },
    });

    // Map to CalendarEvent-like format for frontend compatibility
    const events = cohorts.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.category || 'live_session',
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      courseId: c.courseId,
      instructorName: c.instructorName || c.instructor?.name || undefined,
      meetingUrl: c.meetingUrl,
      color: c.color,
      attendees: c.enrolledCount,
      maxAttendees: c.capacity,
      status: c.status,
      location: c.location,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Live cohorts fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch live cohorts' }, { status: 500 });
  }
}

// POST /api/live-cohorts - Create a new live cohort
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tenantId,
      title,
      description,
      courseId,
      instructorId,
      startDate,
      endDate,
      location,
      meetingUrl,
      capacity,
      status,
      category,
      color,
      instructorName,
    } = body;

    if (!tenantId || !title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, title, startDate, endDate' },
        { status: 400 }
      );
    }

    const cohort = await db.liveCohort.create({
      data: {
        tenantId,
        title,
        description: description || null,
        courseId: courseId || null,
        instructorId: instructorId || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location || null,
        meetingUrl: meetingUrl || null,
        capacity: capacity || 30,
        enrolledCount: 0,
        status: status || 'upcoming',
        category: category || 'live_session',
        color: color || null,
        instructorName: instructorName || null,
      },
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

    // Map to CalendarEvent-like format
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

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Live cohort create error:', error);
    return NextResponse.json({ error: 'Failed to create live cohort' }, { status: 500 });
  }
}
