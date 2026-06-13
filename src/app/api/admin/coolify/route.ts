import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const COOLIFY_URL = process.env.COOLIFY_URL || 'https://coolifysarver3.ailearnersbd.com';
const COOLIFY_API_TOKEN = process.env.COOLIFY_API_TOKEN || '4|fUS8veD6YvqpNV7CNUb1hIuhTTHX9XTm4eQ8WQmMad2cda93';

async function fetchFromCoolify(path: string, options: RequestInit = {}) {
  const url = `${COOLIFY_URL}/api/v1${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${COOLIFY_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Coolify API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// GET /api/admin/coolify?action=xxx
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized. Super-Admin role required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 });
    }

    switch (action) {
      case 'projects': {
        const data = await fetchFromCoolify('/projects');
        return NextResponse.json(data);
      }
      case 'project': {
        const uuid = searchParams.get('uuid');
        if (!uuid) return NextResponse.json({ error: 'Project UUID is required' }, { status: 400 });
        const data = await fetchFromCoolify(`/projects/${uuid}`);
        return NextResponse.json(data);
      }
      case 'application': {
        const uuid = searchParams.get('uuid');
        if (!uuid) return NextResponse.json({ error: 'Application UUID is required' }, { status: 400 });
        const data = await fetchFromCoolify(`/applications/${uuid}`);
        return NextResponse.json(data);
      }
      case 'database': {
        const uuid = searchParams.get('uuid');
        if (!uuid) return NextResponse.json({ error: 'Database UUID is required' }, { status: 400 });
        const data = await fetchFromCoolify(`/databases/${uuid}`);
        return NextResponse.json(data);
      }
      default:
        return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Coolify proxy GET error:', error);
    return NextResponse.json({ error: error.message || 'Coolify API failure' }, { status: 500 });
  }
}

// POST /api/admin/coolify
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized. Super-Admin role required.' }, { status: 401 });
    }

    const body = await request.json();
    const { action, applicationUuid } = body;

    if (action === 'deploy') {
      if (!applicationUuid) {
        return NextResponse.json({ error: 'Application UUID is required' }, { status: 400 });
      }
      // Coolify API redeploy endpoint: POST /api/v1/applications/{uuid}/deploy
      const data = await fetchFromCoolify(`/applications/${applicationUuid}/deploy`, {
        method: 'POST',
      });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('Coolify proxy POST error:', error);
    return NextResponse.json({ error: error.message || 'Coolify API failure' }, { status: 500 });
  }
}
