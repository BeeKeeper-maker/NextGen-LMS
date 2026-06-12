import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper: update daily metrics for analytics
async function updateDailyMetric(tenantId: string, field: 'activeUsers' | 'newEnrollments' | 'completions' | 'revenue' | 'quizAttempts', increment: number = 1) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const existing = await db.dailyMetric.findUnique({
      where: { tenantId_date: { tenantId, date: today.toISOString() } },
    });

    if (existing) {
      await db.dailyMetric.update({
        where: { id: existing.id },
        data: { [field]: { increment } },
      });
    } else {
      await db.dailyMetric.create({
        data: {
          tenantId,
          date: today.toISOString(),
          [field]: increment,
        },
      });
    }
  } catch (error) {
    console.error('Daily metric update error:', error);
  }
}

// GET /api/analytics/events?tenantId=xxx&eventType=yyy - Query events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const eventType = searchParams.get('eventType');
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: tenantId' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { tenantId };
    if (eventType) where.eventType = eventType;
    if (userId) where.userId = userId;
    if (sessionId) where.sessionId = sessionId;
    if (startDate || endDate) {
      const createdAt: Record<string, unknown> = {};
      if (startDate) createdAt.gte = new Date(startDate).toISOString();
      if (endDate) createdAt.lte = new Date(endDate).toISOString();
      where.createdAt = createdAt;
    }

    const [events, total] = await Promise.all([
      db.analyticsEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.analyticsEvent.count({ where }),
    ]);

    // Compute event type summary if no specific eventType requested
    let summary: Record<string, number> | undefined;
    if (!eventType) {
      const eventTypeCounts = await db.analyticsEvent.groupBy({
        by: ['eventType'],
        where,
        _count: { eventType: true },
      });
      summary = {};
      for (const item of eventTypeCounts) {
        summary[item.eventType] = item._count.eventType;
      }
    }

    return NextResponse.json({
      events,
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Analytics events fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics events' }, { status: 500 });
  }
}

// POST /api/analytics/events - Track event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, userId, eventType, eventData, sessionId } = body;

    if (!tenantId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, eventType' },
        { status: 400 }
      );
    }

    const event = await db.analyticsEvent.create({
      data: {
        tenantId,
        userId: userId || null,
        eventType,
        eventData: eventData
          ? (typeof eventData === 'string' ? eventData : JSON.stringify(eventData))
          : null,
        sessionId: sessionId || null,
      },
    });

    // === FIX 5: Update DailyMetric based on event type ===
    switch (eventType) {
      case 'enrollment':
        await updateDailyMetric(tenantId, 'newEnrollments', 1);
        if (userId) {
          await updateDailyMetric(tenantId, 'activeUsers', 1);
        }
        break;
      case 'completion':
        await updateDailyMetric(tenantId, 'completions', 1);
        break;
      case 'revenue': {
        // For revenue, increment by the amount if provided
        let revenueAmount = 1;
        if (eventData) {
          try {
            const data = typeof eventData === 'string' ? JSON.parse(eventData) : eventData;
            if (data.amount && typeof data.amount === 'number') {
              revenueAmount = data.amount;
            }
          } catch {
            // Use default
          }
        }
        await updateDailyMetric(tenantId, 'revenue', revenueAmount);
        break;
      }
      case 'quiz_attempt':
        await updateDailyMetric(tenantId, 'quizAttempts', 1);
        break;
      case 'login':
      case 'page_view':
      case 'lesson_start':
      case 'lesson_complete':
        if (userId) {
          await updateDailyMetric(tenantId, 'activeUsers', 1);
        }
        break;
      default:
        break;
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Analytics event track error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}
