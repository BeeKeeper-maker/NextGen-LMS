import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/achievements?tenantId=xxx or ?userId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    // If userId is provided, return user's earned achievements
    if (userId) {
      const userAchievements = await db.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true,
        },
        orderBy: { earnedAt: 'desc' },
      });

      // If tenantId is also specified, only return achievements for that tenant
      const filtered = tenantId
        ? userAchievements.filter((ua) => ua.achievement.tenantId === tenantId)
        : userAchievements;

      return NextResponse.json(filtered);
    }

    // Otherwise list all achievements for a tenant
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: tenantId or userId' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { tenantId };
    if (type) where.type = type;

    const achievements = await db.achievement.findMany({
      where,
      include: {
        _count: {
          select: { userAchievements: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Achievements fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}
