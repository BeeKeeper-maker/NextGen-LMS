import { NextResponse } from 'next/server';

// Server-side coupon validation
// In a production app, coupons would be stored in the database
// with usage limits, expiry dates, and per-user restrictions.
const VALID_COUPONS: Record<string, { discount: number; label: string; active: boolean }> = {
  SAVE20: { discount: 0.2, label: '20% OFF', active: true },
  WELCOME10: { discount: 0.1, label: '10% OFF', active: true },
  LAUNCH50: { discount: 0.5, label: '50% OFF', active: true },
};

// POST /api/coupons/validate - Validate a coupon code
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();
    const coupon = VALID_COUPONS[normalizedCode];

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: 'Invalid coupon code' },
        { status: 200 }
      );
    }

    if (!coupon.active) {
      return NextResponse.json(
        { valid: false, error: 'This coupon has expired' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      discount: coupon.discount,
      label: coupon.label,
      code: normalizedCode,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
