import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenantId parameter' }, { status: 400 });
    }

    const config = await db.tenantConfig.findUnique({
      where: { tenantId },
      select: {
        stripePublishableKey: true,
        paypalClientId: true,
      },
    });

    if (!config) {
      return NextResponse.json({
        stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null,
        paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || null,
      });
    }

    return NextResponse.json({
      stripePublishableKey: config.stripePublishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null,
      paypalClientId: config.paypalClientId || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || null,
    });
  } catch (error: any) {
    console.error('Failed to fetch checkout credentials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
