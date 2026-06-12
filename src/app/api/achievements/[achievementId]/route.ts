import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/achievements/[achievementId] - Update an achievement
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ achievementId: string }> }
) {
  try {
    const { achievementId } = await params;
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    const existing = await db.achievement.findUnique({ where: { id: achievementId } });
    if (!existing) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    if (tenantId && existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'description', 'icon', 'type', 'criteria', 'points', 'isActive'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const achievement = await db.achievement.update({
      where: { id: achievementId },
      data: updateData,
      include: {
        _count: {
          select: { userAchievements: true },
        },
      },
    });

    return NextResponse.json(achievement);
  } catch (error) {
    console.error('Achievement update error:', error);
    return NextResponse.json({ error: 'Failed to update achievement' }, { status: 500 });
  }
}

// DELETE /api/achievements/[achievementId] - Delete an achievement
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ achievementId: string }> }
) {
  try {
    const { achievementId } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    const existing = await db.achievement.findUnique({ where: { id: achievementId } });
    if (!existing) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    if (tenantId && existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.achievement.delete({ where: { id: achievementId } });

    return NextResponse.json({ success: true, message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Achievement delete error:', error);
    return NextResponse.json({ error: 'Failed to delete achievement' }, { status: 500 });
  }
}
