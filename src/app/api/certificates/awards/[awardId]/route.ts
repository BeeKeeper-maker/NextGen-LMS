import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/certificates/awards/[awardId] - Revoke a certificate award
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ awardId: string }> }
) {
  try {
    const { awardId } = await params;

    const existing = await db.certificateAward.findUnique({
      where: { id: awardId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Certificate award not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    if (tenantId && existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.certificateAward.delete({ where: { id: awardId } });

    return NextResponse.json({ success: true, message: 'Certificate award revoked successfully' });
  } catch (error) {
    console.error('Certificate award revoke error:', error);
    return NextResponse.json({ error: 'Failed to revoke certificate award' }, { status: 500 });
  }
}
