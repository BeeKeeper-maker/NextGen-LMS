import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/assessments/[assessmentId]/submit - Submit quiz answers and auto-grade
export async function POST(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await params;
    const body = await request.json();
    const { userId, tenantId, answers, timeTaken } = body;

    if (!userId || !tenantId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, tenantId, answers' },
        { status: 400 }
      );
    }

    // Get assessment with questions for grading
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Check attempt limit
    const previousSubmissions = await db.quizSubmission.count({
      where: { userId, assessmentId },
    });

    if (previousSubmissions >= assessment.maxAttempts) {
      return NextResponse.json(
        { error: 'Maximum number of attempts reached' },
        { status: 403 }
      );
    }

    // Auto-grade the submission
    const answersMap: Record<string, string> = answers;
    let totalPoints = 0;
    let earnedPoints = 0;

    const gradedQuestions = assessment.questions.map((question) => {
      const userAnswer = answersMap[question.id] || '';
      const points = question.points;
      totalPoints += points;

      let isCorrect = false;

      if (question.correctAnswer) {
        try {
          const correctAnswer = JSON.parse(question.correctAnswer);
          if (typeof correctAnswer === 'string') {
            isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
          } else if (Array.isArray(correctAnswer)) {
            const userAnswers = userAnswer.split(',').map((a: string) => a.trim().toLowerCase());
            isCorrect = correctAnswer.every(
              (ca: string) => userAnswers.includes(ca.toLowerCase())
            ) && userAnswers.length === correctAnswer.length;
          }
        } catch {
          isCorrect = userAnswer === question.correctAnswer;
        }
      }

      if (isCorrect) {
        earnedPoints += points;
      }

      return {
        questionId: question.id,
        userAnswer,
        isCorrect,
        points,
        earned: isCorrect ? points : 0,
      };
    });

    const percentScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentScore >= assessment.passingScore;

    // Create submission
    const submission = await db.quizSubmission.create({
      data: {
        userId,
        assessmentId,
        tenantId,
        answers: JSON.stringify(answersMap),
        score: earnedPoints,
        maxScore: totalPoints,
        percentScore,
        passed,
        timeTaken,
        gradedAt: new Date().toISOString(),
        feedback: passed
          ? `Congratulations! You passed with ${percentScore}%.`
          : `You scored ${percentScore}%. You need ${assessment.passingScore}% to pass. Keep trying!`,
      },
    });

    // If user passed, award points to user
    if (passed) {
      await db.user.update({
        where: { id: userId },
        data: { totalPoints: { increment: 25 } },
      });
    }

    return NextResponse.json({
      submission,
      grading: {
        totalPoints,
        earnedPoints,
        percentScore,
        passed,
        questionResults: gradedQuestions,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Assessment submission error:', error);
    return NextResponse.json({ error: 'Failed to submit assessment' }, { status: 500 });
  }
}
