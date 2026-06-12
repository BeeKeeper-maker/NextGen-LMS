import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/data-exports?tenantId=xxx
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

    const exports = await db.dataExport.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(exports);
  } catch (error) {
    console.error('Data exports fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch data exports' }, { status: 500 });
  }
}

// POST /api/data-exports
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, filename, type, format, size, status } = body;

    if (!tenantId || !filename || !type || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, filename, type, format' },
        { status: 400 }
      );
    }

    const dataExport = await db.dataExport.create({
      data: {
        tenantId,
        filename,
        type,
        format,
        size: size || '0 KB',
        status: status || 'completed',
      },
    });

    return NextResponse.json(dataExport, { status: 201 });
  } catch (error) {
    console.error('Data export create error:', error);
    return NextResponse.json({ error: 'Failed to create data export' }, { status: 500 });
  }
}

// DELETE /api/data-exports?id=xxx
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required query parameter: id' },
        { status: 400 }
      );
    }

    await db.dataExport.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Data export delete error:', error);
    return NextResponse.json({ error: 'Failed to delete data export' }, { status: 500 });
  }
}
