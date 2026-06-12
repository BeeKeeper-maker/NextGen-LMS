import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper: generate a unique verification code
function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 8; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CERT-${Date.now()}-${randomStr}`;
}

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

// PUT /api/enrollments/[enrollmentId] - Update enrollment progress
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await params;
    const body = await request.json();

    const existing = await db.enrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['status', 'progress', 'completedAt', 'expiresAt', 'lastAccessedAt'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // If progress is 100%, auto-complete
    const isCompleting = body.progress !== undefined && body.progress >= 100 && existing.status !== 'completed';
    if (isCompleting) {
      updateData.progress = 100;
      updateData.status = 'completed';
      updateData.completedAt = new Date().toISOString();
    }

    // Update lastAccessedAt to now if not explicitly set
    if (!body.lastAccessedAt) {
      updateData.lastAccessedAt = new Date().toISOString();
    }

    const enrollment = await db.enrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: {
        course: {
          select: { id: true, title: true, slug: true, thumbnailUrl: true, certificateTemplateId: true, tenantId: true },
        },
      },
    });

    // === FIX 2: Auto-Certificate on Course Completion ===
    if (isCompleting && enrollment.course.certificateTemplateId) {
      try {
        // Check if certificate already awarded for this course and user
        const existingCert = await db.certificateAward.findFirst({
          where: {
            userId: existing.userId,
            courseId: existing.courseId,
            certificateId: enrollment.course.certificateTemplateId,
          },
        });

        if (!existingCert) {
          await db.certificateAward.create({
            data: {
              userId: existing.userId,
              certificateId: enrollment.course.certificateTemplateId,
              tenantId: existing.tenantId,
              courseId: existing.courseId,
              enrollmentId: enrollment.id,
              verificationCode: generateVerificationCode(),
              issuedAt: new Date(),
            },
          });

          // Award bonus points for course completion
          await db.user.update({
            where: { id: existing.userId },
            data: { totalPoints: { increment: 50 } },
          });
        }
      } catch (certError) {
        console.error('Auto-certificate error:', certError);
      }

      // Track completion analytics event
      try {
        await db.analyticsEvent.create({
          data: {
            tenantId: existing.tenantId,
            userId: existing.userId,
            eventType: 'completion',
            eventData: JSON.stringify({ courseId: existing.courseId, enrollmentId }),
          },
        });
        await updateDailyMetric(existing.tenantId, 'completions', 1);
      } catch (analyticsError) {
        console.error('Completion analytics tracking error:', analyticsError);
      }
    }

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error('Enrollment update error:', error);
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 });
  }
}

// DELETE /api/enrollments/[enrollmentId] - Withdraw from course
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await params;

    const existing = await db.enrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Delete enrollment and decrement course enrollment count
    await db.$transaction(async (tx) => {
      await tx.enrollment.delete({ where: { id: enrollmentId } });

      await tx.course.update({
        where: { id: existing.courseId },
        data: { enrollmentCount: { decrement: 1 } },
      });
    });

    return NextResponse.json({ success: true, message: 'Enrollment withdrawn successfully' });
  } catch (error) {
    console.error('Enrollment delete error:', error);
    return NextResponse.json({ error: 'Failed to withdraw from course' }, { status: 500 });
  }
}
