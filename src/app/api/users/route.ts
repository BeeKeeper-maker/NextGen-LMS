import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users?tenantId=xxx - List users in tenant
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (role) where.role = role;
    if (isActive !== null) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          tenantId: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          timezone: true,
          locale: true,
          streakDays: true,
          totalPoints: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              enrollments: true,
              userAchievements: true,
              certificateAwards: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tenantId,
      email,
      name,
      avatarUrl,
      role,
      bio,
      timezone,
      locale,
    } = body;

    if (!tenantId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, email' },
        { status: 400 }
      );
    }

    // Check email uniqueness within tenant
    const existing = await db.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email already exists in this tenant' },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: {
        tenantId,
        email,
        name,
        avatarUrl,
        role: role || 'learner',
        bio,
        timezone: timezone || 'UTC',
        locale: locale || 'en',
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        bio: true,
        timezone: true,
        locale: true,
        streakDays: true,
        totalPoints: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
