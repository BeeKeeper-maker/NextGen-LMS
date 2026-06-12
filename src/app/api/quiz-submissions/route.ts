import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/quiz-submissions?userId=xxx&assessmentId=yyy - Get user's quiz submissions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const assessmentId = searchParams.get('assessmentId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const where: Record<string, unknown> = { userId };
    if (assessmentId) where.assessmentId = assessmentId;

    const submissions = await db.quizSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Quiz submissions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz submissions' }, { status: 500 });
  }
}
