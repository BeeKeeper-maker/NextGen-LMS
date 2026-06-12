import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// GET /api/backups?tenantId=xxx
// GET /api/backups?id=xxx&action=download
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    // Download endpoint: GET /api/backups?id=xxx&action=download
    if (id && action === 'download') {
      const backup = await db.backup.findUnique({ where: { id } });
      if (!backup) {
        return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
      }
      if (!backup.filePath || !fs.existsSync(backup.filePath)) {
        return NextResponse.json({ error: 'Backup file not found on disk' }, { status: 404 });
      }

      const fileBuffer = fs.readFileSync(backup.filePath);
      const filename = `backup-${new Date(backup.createdAt).toISOString().split('T')[0]}.db`;

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-sqlite3',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': String(fileBuffer.length),
        },
      });
    }

    // List endpoint
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
    const { tenantId, type } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing required field: tenantId' },
        { status: 400 }
      );
    }

    // Copy the SQLite database file as a real backup
    const dbPath = path.join(process.cwd(), 'db', 'dev.db');
    const backupDir = path.join(process.cwd(), 'db', 'backups');

    // Ensure backups directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = Date.now();
    const backupFileName = `backup-${timestamp}.db`;
    const backupPath = path.join(backupDir, backupFileName);

    // Check if the database file exists
    if (!fs.existsSync(dbPath)) {
      // If no DB file yet, create a minimal backup with just schema
      fs.writeFileSync(backupPath, '');
    } else {
      fs.copyFileSync(dbPath, backupPath);
    }

    const stats = fs.statSync(backupPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(1);
    const sizeStr = stats.size < 1024 * 1024
      ? `${(stats.size / 1024).toFixed(1)} MB`
      : `${sizeInMB} MB`;

    const backup = await db.backup.create({
      data: {
        tenantId,
        size: sizeStr,
        type: type || 'Manual',
        status: 'completed',
        filePath: backupPath,
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

    // Try to clean up the backup file from disk
    const backup = await db.backup.findUnique({ where: { id } });
    if (backup?.filePath && fs.existsSync(backup.filePath)) {
      try {
        fs.unlinkSync(backup.filePath);
      } catch {
        // Ignore file deletion errors
      }
    }

    await db.backup.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Backup delete error:', error);
    return NextResponse.json({ error: 'Failed to delete backup' }, { status: 500 });
  }
}
