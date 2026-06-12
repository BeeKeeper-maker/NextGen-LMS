import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/learning-paths/enroll - Enroll a user in a learning path
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { learningPathId, userId, tenantId } = body;

    if (!learningPathId || !userId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields: learningPathId, userId, tenantId' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await db.learningPathEnrollment.findUnique({
      where: {
        learningPathId_userId: { learningPathId, userId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already enrolled in this learning path' },
        { status: 409 }
      );
    }

    // Verify the learning path exists
    const path = await db.learningPath.findUnique({
      where: { id: learningPathId },
    });

    if (!path) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      );
    }

    const enrollment = await db.learningPathEnrollment.create({
      data: {
        learningPathId,
        userId,
        tenantId,
        status: 'active',
        progress: 0,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error('Learning path enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in learning path' },
      { status: 500 }
    );
  }
}
