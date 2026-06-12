import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/data-imports?tenantId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: tenantId' },
        { status: 400 }
      );
    }

    const imports = await db.dataImport.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(imports);
  } catch (error) {
    console.error('Data imports fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch data imports' }, { status: 500 });
  }
}

// POST /api/data-imports
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, filename, type, records, status } = body;

    if (!tenantId || !filename || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, filename, type' },
        { status: 400 }
      );
    }

    const dataImport = await db.dataImport.create({
      data: {
        tenantId,
        filename,
        type,
        records: records || 0,
        status: status || 'completed',
      },
    });

    return NextResponse.json(dataImport, { status: 201 });
  } catch (error) {
    console.error('Data import create error:', error);
    return NextResponse.json({ error: 'Failed to create data import' }, { status: 500 });
  }
}
