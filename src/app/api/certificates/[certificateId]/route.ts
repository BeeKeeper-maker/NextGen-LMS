import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/certificates/[certificateId] - Update certificate template
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;
    const body = await request.json();

    const existing = await db.certificate.findUnique({ where: { id: certificateId } });
    if (!existing) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Verify tenantId if provided (from body or query param)
    const { searchParams } = new URL(request.url);
    const tenantId = body.tenantId || searchParams.get('tenantId');
    if (tenantId && existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'template', 'backgroundUrl', 'isActive'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'template' && typeof body[field] !== 'string') {
          updateData[field] = JSON.stringify(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const certificate = await db.certificate.update({
      where: { id: certificateId },
      data: updateData,
      include: {
        _count: { select: { awards: true } },
      },
    });

    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Certificate update error:', error);
    return NextResponse.json({ error: 'Failed to update certificate template' }, { status: 500 });
  }
}

// DELETE /api/certificates/[certificateId] - Delete certificate template
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;

    const existing = await db.certificate.findUnique({ where: { id: certificateId } });
    if (!existing) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Verify tenantId if provided
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    if (tenantId && existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.certificate.delete({ where: { id: certificateId } });

    return NextResponse.json({ success: true, message: 'Certificate template deleted successfully' });
  } catch (error) {
    console.error('Certificate delete error:', error);
    return NextResponse.json({ error: 'Failed to delete certificate template' }, { status: 500 });
  }
}
