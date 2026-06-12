import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ─── CSV Helper ─────────────────────────────────────────────
function escapeCSV(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function objectsToCSV(objects: Record<string, unknown>[]): string {
  if (objects.length === 0) return '';
  const headers = Object.keys(objects[0]);
  const headerLine = headers.map(escapeCSV).join(',');
  const rows = objects.map((obj) =>
    headers.map((h) => escapeCSV(obj[h])).join(',')
  );
  return [headerLine, ...rows].join('\n');
}

function flattenForExport(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(result, flattenForExport(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value instanceof Date ? value.toISOString() : value;
    }
  }
  return result;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Data Query Functions ───────────────────────────────────
async function queryExportData(tenantId: string, type: string): Promise<Record<string, unknown>[]> {
  switch (type) {
    case 'courses': {
      const courses = await db.course.findMany({
        where: { tenantId },
        include: { modules: { include: { lessons: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return courses.map((c) => {
        const { modules, ...rest } = c;
        return {
          ...flattenForExport(rest as unknown as Record<string, unknown>),
          moduleCount: modules.length,
          lessonCount: modules.reduce((sum, m) => sum + m.lessons.length, 0),
        };
      });
    }
    case 'users': {
      const users = await db.user.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });
      return users.map((u) => flattenForExport(u as unknown as Record<string, unknown>));
    }
    case 'community': {
      const posts = await db.communityPost.findMany({
        where: { tenantId },
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return posts.map((p) => {
        const { author, ...rest } = p;
        return {
          ...flattenForExport(rest as unknown as Record<string, unknown>),
          authorName: author?.name || '',
          authorEmail: author?.email || '',
        };
      });
    }
    case 'assessments': {
      const assessments = await db.assessment.findMany({
        where: { tenantId },
        include: { questions: true },
        orderBy: { createdAt: 'desc' },
      });
      return assessments.map((a) => {
        const { questions, ...rest } = a;
        return {
          ...flattenForExport(rest as unknown as Record<string, unknown>),
          questionCount: questions.length,
        };
      });
    }
    case 'analytics': {
      const metrics = await db.dailyMetric.findMany({
        where: { tenantId },
        orderBy: { date: 'desc' },
      });
      return metrics.map((m) => flattenForExport(m as unknown as Record<string, unknown>));
    }
    case 'financial': {
      const orders = await db.order.findMany({
        where: { tenantId },
        include: { product: { select: { name: true } }, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return orders.map((o) => {
        const { product, user, ...rest } = o;
        return {
          ...flattenForExport(rest as unknown as Record<string, unknown>),
          productName: product?.name || '',
          userName: user?.name || '',
          userEmail: user?.email || '',
        };
      });
    }
    default:
      return [];
  }
}

// GET /api/data-exports?tenantId=xxx
// GET /api/data-exports?id=xxx&action=download
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    // Download endpoint: GET /api/data-exports?id=xxx&action=download
    if (id && action === 'download') {
      const exportRecord = await db.dataExport.findUnique({ where: { id } });
      if (!exportRecord) {
        return NextResponse.json({ error: 'Export not found' }, { status: 404 });
      }
      if (!exportRecord.data) {
        return NextResponse.json({ error: 'Export file data is empty' }, { status: 404 });
      }

      const isCSV = exportRecord.format === 'csv' || exportRecord.format === 'xlsx';
      const contentType = isCSV ? 'text/csv' : 'application/json';
      const extension = exportRecord.format === 'xlsx' ? 'xlsx' : exportRecord.format;

      return new NextResponse(exportRecord.data, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${exportRecord.filename}"`,
          'Content-Length': String(Buffer.byteLength(exportRecord.data, 'utf-8')),
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
    const { tenantId, filename, type, format } = body;

    if (!tenantId || !filename || !type || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, filename, type, format' },
        { status: 400 }
      );
    }

    // 1. Query the relevant data
    const data = await queryExportData(tenantId, type);
    const recordCount = data.length;

    // 2. Convert to requested format
    let fileContent: string;
    if (format === 'json') {
      fileContent = JSON.stringify(data, null, 2);
    } else {
      // csv or xlsx (use CSV for both)
      fileContent = objectsToCSV(data);
    }

    // 3. Calculate real file size
    const sizeBytes = Buffer.byteLength(fileContent, 'utf-8');
    const sizeStr = formatFileSize(sizeBytes);

    // 4. Create the export record with actual data
    const dataExport = await db.dataExport.create({
      data: {
        tenantId,
        filename,
        type,
        format,
        size: sizeStr,
        recordCount,
        status: 'completed',
        data: fileContent,
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
