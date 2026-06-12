import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/certificates?tenantId=xxx - List certificate templates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (isActive !== null) where.isActive = isActive === 'true';

    const certificates = await db.certificate.findMany({
      where,
      include: {
        _count: {
          select: { awards: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error('Certificates fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}

// POST /api/certificates - Create certificate template
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, name, template, backgroundUrl, isActive } = body;

    if (!tenantId || !name || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, name, template' },
        { status: 400 }
      );
    }

    const certificate = await db.certificate.create({
      data: {
        tenantId,
        name,
        template: typeof template === 'string' ? template : JSON.stringify(template),
        backgroundUrl,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error('Certificate creation error:', error);
    return NextResponse.json({ error: 'Failed to create certificate template' }, { status: 500 });
  }
}
