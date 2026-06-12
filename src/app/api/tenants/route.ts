import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/slugify';

// GET /api/tenants?slug=xxx - Get tenant by slug (for domain resolution)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const tenant = await db.tenant.findUnique({
        where: { slug },
        include: {
          _count: {
            select: {
              users: true,
              courses: true,
              communityPosts: true,
            },
          },
        },
      });

      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }

      return NextResponse.json(tenant);
    }

    // List all tenants if no slug specified
    const tenants = await db.tenant.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            users: true,
            courses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error('Tenants fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

// POST /api/tenants - Create tenant
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      domain,
      logoUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      description,
      plan,
      maxUsers,
      currency,
      locale,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await db.tenant.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'A tenant with this slug already exists' },
        { status: 409 }
      );
    }

    const tenant = await db.tenant.create({
      data: {
        name,
        slug: slugify(slug),
        domain,
        logoUrl,
        primaryColor: primaryColor || '#0F172A',
        secondaryColor: secondaryColor || '#6366F1',
        accentColor: accentColor || '#10B981',
        fontFamily: fontFamily || 'Inter',
        description,
        plan: plan || 'professional',
        maxUsers: maxUsers || 1000,
        currency: currency || 'USD',
        locale: locale || 'en',
      },
    });

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    console.error('Tenant creation error:', error);
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}
