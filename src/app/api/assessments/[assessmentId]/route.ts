import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/assessments/[assessmentId] - Get assessment with questions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await params;

    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
        course: {
          select: { id: true, title: true, slug: true },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Assessment fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 });
  }
}

// PUT /api/assessments/[assessmentId] - Update assessment
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await params;
    const body = await request.json();

    const existing = await db.assessment.findUnique({ where: { id: assessmentId } });
    if (!existing) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'title', 'description', 'type', 'passingScore', 'maxAttempts',
      'timeLimit', 'isPublished', 'shuffleQuestions',
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle questions update if provided
    if (body.questions && Array.isArray(body.questions)) {
      await db.$transaction(async (tx) => {
        // Update assessment
        await tx.assessment.update({
          where: { id: assessmentId },
          data: updateData,
        });

        // Delete existing questions and recreate
        await tx.question.deleteMany({
          where: { assessmentId },
        });

        for (let i = 0; i < body.questions.length; i++) {
          const q = body.questions[i];
          await tx.question.create({
            data: {
              assessmentId,
              type: q.type || 'multiple_choice',
              question: q.question,
              options: q.options ? JSON.stringify(q.options) : null,
              correctAnswer: q.correctAnswer ? JSON.stringify(q.correctAnswer) : null,
              explanation: q.explanation,
              points: q.points ?? 1,
              orderIndex: q.orderIndex ?? i,
              poolGroup: q.poolGroup,
              difficulty: q.difficulty || 'medium',
            },
          });
        }
      });

      const updated = await db.assessment.findUnique({
        where: { id: assessmentId },
        include: {
          questions: { orderBy: { orderIndex: 'asc' } },
        },
      });

      return NextResponse.json(updated);
    }

    const assessment = await db.assessment.update({
      where: { id: assessmentId },
      data: updateData,
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
      },
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Assessment update error:', error);
    return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 });
  }
}

// DELETE /api/assessments/[assessmentId] - Delete assessment (cascades to questions and submissions)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await params;

    const existing = await db.assessment.findUnique({ where: { id: assessmentId } });
    if (!existing) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    await db.assessment.delete({ where: { id: assessmentId } });

    return NextResponse.json({ success: true, message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Assessment delete error:', error);
    return NextResponse.json({ error: 'Failed to delete assessment' }, { status: 500 });
  }
}
