import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/tenants/[tenantId] - Get tenant details including branding
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            users: true,
            courses: true,
            communityPosts: true,
            achievements: true,
            certificates: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Tenant fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 });
  }
}

// PUT /api/tenants/[tenantId] - Update tenant (including branding)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const body = await request.json();

    const existing = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!existing) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'name', 'slug', 'domain', 'logoUrl',
      'primaryColor', 'secondaryColor', 'accentColor', 'fontFamily',
      'description', 'isActive', 'plan', 'maxUsers', 'currency', 'locale',
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Check slug uniqueness if being updated
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await db.tenant.findUnique({ where: { slug: body.slug } });
      if (slugExists) {
        return NextResponse.json(
          { error: 'A tenant with this slug already exists' },
          { status: 409 }
        );
      }
    }

    const tenant = await db.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Tenant update error:', error);
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}
