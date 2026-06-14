import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/admin/billing - List all transactions (Order records) globally
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized. Super-Admin role required.' }, { status: 401 });
    }

    const orders = await db.order.findMany({
      include: {
        tenant: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Failed to fetch global transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction records' }, { status: 500 });
  }
}
