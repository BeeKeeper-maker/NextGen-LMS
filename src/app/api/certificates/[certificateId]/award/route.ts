import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateVerificationCode } from '@/lib/slugify';

// POST /api/certificates/[certificateId]/award - Award certificate to user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;
    const body = await request.json();
    const { userId, courseId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Verify certificate template exists
    const certificate = await db.certificate.findUnique({
      where: { id: certificateId },
    });
    if (!certificate) {
      return NextResponse.json({ error: 'Certificate template not found' }, { status: 404 });
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate a unique verification code
    let verificationCode = generateVerificationCode();
    let codeExists = await db.certificateAward.findUnique({
      where: { verificationCode },
    });
    while (codeExists) {
      verificationCode = generateVerificationCode();
      codeExists = await db.certificateAward.findUnique({
        where: { verificationCode },
      });
    }

    const award = await db.certificateAward.create({
      data: {
        userId,
        certificateId,
        tenantId: certificate.tenantId,
        courseId: courseId || null,
        verificationCode,
      },
      include: {
        certificate: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Award points to user for earning a certificate
    await db.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: 150 } },
    });

    return NextResponse.json(award, { status: 201 });
  } catch (error) {
    console.error('Certificate award error:', error);
    return NextResponse.json({ error: 'Failed to award certificate' }, { status: 500 });
  }
}
