import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/orders?userId=xxx&tenantId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tenantId = searchParams.get('tenantId');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (tenantId) where.tenantId = tenantId;

    const orders = await db.order.findMany({
      where,
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Create an order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, userId, productId, amount, currency, paymentProvider, paymentId } = body;

    if (!tenantId || !productId || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, productId, amount' },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const order = await db.order.create({
      data: {
        tenantId,
        userId: userId || null,
        productId,
        amount,
        currency: currency || 'USD',
        status: 'completed',
        paymentProvider: paymentProvider || null,
        paymentId: paymentId || null,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order create error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
