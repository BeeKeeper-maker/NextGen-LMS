import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/newsletter - Subscribe an email to the newsletter
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Already subscribed', id: existing.id },
        { status: 200 }
      );
    }

    // Use the first tenant as default for landing page subscriptions
    const firstTenant = await db.tenant.findFirst();
    const tenantId = firstTenant?.id || 'default';

    const subscriber = await db.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        tenantId,
        source: 'landing',
      },
    });

    return NextResponse.json(
      { message: 'Successfully subscribed', id: subscriber.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
