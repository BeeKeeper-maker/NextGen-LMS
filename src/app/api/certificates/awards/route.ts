import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/certificates/awards?tenantId=xxx - List all certificate awards
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;

    const awards = await db.certificateAward.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        certificate: {
          select: { id: true, name: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    // Enrich with course name if courseId exists
    const enriched = await Promise.all(
      awards.map(async (award) => {
        let courseName: string | null = null;
        if (award.courseId) {
          const course = await db.course.findUnique({
            where: { id: award.courseId },
            select: { title: true },
          });
          courseName = course?.title ?? null;
        }
        return {
          ...award,
          recipientName: award.user.name || award.user.email,
          courseName: courseName || 'General',
          certName: award.certificate.name,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Certificate awards fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificate awards' },
      { status: 500 }
    );
  }
}
