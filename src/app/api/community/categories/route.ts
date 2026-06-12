import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    const where = tenantId ? { tenantId } : {};

    const categories = await db.communityCategory.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, name, description, icon, color, isDefault } = body;

    if (!tenantId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, name' },
        { status: 400 }
      );
    }

    // Get the max orderIndex for this tenant
    const maxOrder = await db.communityCategory.findFirst({
      where: { tenantId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    const category = await db.communityCategory.create({
      data: {
        tenantId,
        name,
        description: description || null,
        icon: icon || null,
        color: color || null,
        orderIndex: (maxOrder?.orderIndex || 0) + 1,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Category create error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { categories } = body as { categories: { id: string; orderIndex: number; name?: string; description?: string; icon?: string; color?: string }[] };

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Missing required field: categories array' },
        { status: 400 }
      );
    }

    // Update order indices in a transaction
    await db.$transaction(
      categories.map((cat) =>
        db.communityCategory.update({
          where: { id: cat.id },
          data: {
            orderIndex: cat.orderIndex,
            ...(cat.name !== undefined ? { name: cat.name } : {}),
            ...(cat.description !== undefined ? { description: cat.description } : {}),
            ...(cat.icon !== undefined ? { icon: cat.icon } : {}),
            ...(cat.color !== undefined ? { color: cat.color } : {}),
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Category update error:', error);
    return NextResponse.json({ error: 'Failed to update categories' }, { status: 500 });
  }
}
