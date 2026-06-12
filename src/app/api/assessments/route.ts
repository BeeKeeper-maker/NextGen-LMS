import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/assessments?tenantId=xxx&courseId=yyy - List assessments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const courseId = searchParams.get('courseId');
    const type = searchParams.get('type');
    const isPublished = searchParams.get('isPublished');

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (courseId) where.courseId = courseId;
    if (type) where.type = type;
    if (isPublished !== null) where.isPublished = isPublished === 'true';

    const assessments = await db.assessment.findMany({
      where,
      include: {
        course: {
          select: { id: true, title: true, slug: true, category: true },
        },
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { questions: true, submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Assessments fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}

// POST /api/assessments - Create assessment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      courseId,
      tenantId,
      title,
      description,
      type,
      passingScore,
      maxAttempts,
      timeLimit,
      isPublished,
      shuffleQuestions,
      questions,
    } = body;

    if (!courseId || !tenantId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: courseId, tenantId, title' },
        { status: 400 }
      );
    }

    // Verify course exists
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const assessment = await db.$transaction(async (tx) => {
      const asm = await tx.assessment.create({
        data: {
          courseId,
          tenantId,
          title,
          description,
          type: type || 'quiz',
          passingScore: passingScore ?? 70,
          maxAttempts: maxAttempts ?? 3,
          timeLimit,
          isPublished: isPublished ?? false,
          shuffleQuestions: shuffleQuestions ?? true,
        },
      });

      // Create questions if provided
      if (questions && Array.isArray(questions) && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          await tx.question.create({
            data: {
              assessmentId: asm.id,
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
      }

      return tx.assessment.findUnique({
        where: { id: asm.id },
        include: {
          questions: { orderBy: { orderIndex: 'asc' } },
          course: { select: { id: true, title: true, slug: true } },
        },
      });
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error('Assessment creation error:', error);
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
  }
}
