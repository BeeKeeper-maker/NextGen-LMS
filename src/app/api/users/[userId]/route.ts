import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users/[userId] - Get user profile with enrollments, achievements, points
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          select: { id: true, name: true, slug: true, primaryColor: true, secondaryColor: true, accentColor: true },
        },
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnailUrl: true,
                category: true,
                level: true,
                durationHours: true,
              },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        },
        userAchievements: {
          include: {
            achievement: true,
          },
          orderBy: { earnedAt: 'desc' },
        },
        certificateAwards: {
          include: {
            certificate: true,
          },
          orderBy: { issuedAt: 'desc' },
        },
        _count: {
          select: {
            communityPosts: true,
            communityComments: true,
            lessonProgress: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Compute additional stats
    const completedLessons = await db.lessonProgress.count({
      where: { userId, status: 'completed' },
    });
    const inProgressLessons = await db.lessonProgress.count({
      where: { userId, status: 'in_progress' },
    });

    return NextResponse.json({
      ...user,
      stats: {
        completedLessons,
        inProgressLessons,
        totalEnrollments: user.enrollments.length,
        completedCourses: user.enrollments.filter((e) => e.status === 'completed').length,
        activeCourses: user.enrollments.filter((e) => e.status === 'active').length,
        totalAchievements: user.userAchievements.length,
        totalCertificates: user.certificateAwards.length,
        totalPoints: user.totalPoints,
        streakDays: user.streakDays,
      },
    });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users/[userId] - Update user profile
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();

    const existing = await db.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'email', 'name', 'avatarUrl', 'role', 'bio',
      'timezone', 'locale', 'streakDays', 'totalPoints', 'isActive', 'lastLoginAt',
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // If email is being updated, check uniqueness within tenant
    if (body.email && body.email !== existing.email) {
      const emailExists = await db.user.findUnique({
        where: { tenantId_email: { tenantId: existing.tenantId, email: body.email } },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'A user with this email already exists in this tenant' },
          { status: 409 }
        );
      }
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
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
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
