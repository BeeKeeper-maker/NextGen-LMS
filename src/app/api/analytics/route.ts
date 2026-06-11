import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const metrics = await db.dailyMetric.findMany({
      orderBy: { date: 'desc' },
      take: 30,
    });

    const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalEnrollments = metrics.reduce((sum, m) => sum + m.newEnrollments, 0);
    const totalCompletions = metrics.reduce((sum, m) => sum + m.completions, 0);
    const avgActiveUsers = metrics.length > 0 
      ? Math.round(metrics.reduce((sum, m) => sum + m.activeUsers, 0) / metrics.length) 
      : 0;

    return NextResponse.json({
      metrics,
      summary: {
        totalRevenue,
        totalEnrollments,
        totalCompletions,
        avgActiveUsers,
        mrr: totalRevenue, // simplified
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
