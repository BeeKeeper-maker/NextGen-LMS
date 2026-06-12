import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/backups?tenantId=xxx
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

    const backups = await db.backup.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(backups);
  } catch (error) {
    console.error('Backups fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch backups' }, { status: 500 });
  }
}

// POST /api/backups
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, size, type, status } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing required field: tenantId' },
        { status: 400 }
      );
    }

    const backup = await db.backup.create({
      data: {
        tenantId,
        size: size || '0 GB',
        type: type || 'Manual',
        status: status || 'completed',
      },
    });

    return NextResponse.json(backup, { status: 201 });
  } catch (error) {
    console.error('Backup create error:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}

// DELETE /api/backups?id=xxx
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

    await db.backup.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Backup delete error:', error);
    return NextResponse.json({ error: 'Failed to delete backup' }, { status: 500 });
  }
}
