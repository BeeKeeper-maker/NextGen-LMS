import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper: update daily metrics for analytics
async function updateDailyMetric(tenantId: string, field: 'activeUsers' | 'newEnrollments' | 'completions' | 'revenue' | 'quizAttempts', increment: number = 1) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const existing = await db.dailyMetric.findUnique({
      where: { tenantId_date: { tenantId, date: today.toISOString() } },
    });

    if (existing) {
      await db.dailyMetric.update({
        where: { id: existing.id },
        data: { [field]: { increment } },
      });
    } else {
      await db.dailyMetric.create({
        data: {
          tenantId,
          date: today.toISOString(),
          [field]: increment,
        },
      });
    }
  } catch (error) {
    console.error('Daily metric update error:', error);
  }
}

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

    // === FIX 3: Auto-Enrollment After Checkout ===
    if (order.status === 'completed' && userId && product.type === 'course') {
      try {
        // Extract courseId from product metadata
        let courseId: string | null = null;
        if (product.metadata) {
          try {
            const metadata = JSON.parse(product.metadata);
            courseId = metadata.courseId || metadata.referenceId || null;
          } catch {
            // Invalid metadata JSON
          }
        }

        if (courseId) {
          // Verify course exists
          const course = await db.course.findUnique({ where: { id: courseId } });
          if (course) {
            // Check if already enrolled
            const existingEnrollment = await db.enrollment.findUnique({
              where: { userId_courseId: { userId, courseId } },
            });

            if (!existingEnrollment) {
              // Create enrollment and increment course enrollment count
              await db.$transaction(async (tx) => {
                await tx.enrollment.create({
                  data: {
                    userId,
                    courseId,
                    tenantId,
                    status: 'active',
                    enrolledAt: new Date(),
                    progress: 0,
                  },
                });

                await tx.course.update({
                  where: { id: courseId },
                  data: { enrollmentCount: { increment: 1 } },
                });
              });

              // Track enrollment analytics event
              await db.analyticsEvent.create({
                data: {
                  tenantId,
                  userId,
                  eventType: 'enrollment',
                  eventData: JSON.stringify({ courseId, orderId: order.id, source: 'purchase' }),
                },
              });

              // Update daily metrics
              await updateDailyMetric(tenantId, 'newEnrollments', 1);
            }
          }
        }
      } catch (enrollError) {
        console.error('Auto-enrollment error:', enrollError);
        // Don't fail the order if enrollment fails
      }
    }

    // === FIX 5: Track revenue analytics event ===
    if (order.status === 'completed') {
      try {
        await db.analyticsEvent.create({
          data: {
            tenantId,
            userId: userId || null,
            eventType: 'revenue',
            eventData: JSON.stringify({
              orderId: order.id,
              amount: order.amount,
              currency: order.currency,
              productId,
            }),
          },
        });

        // Update daily revenue metric
        await updateDailyMetric(tenantId, 'revenue', amount);
      } catch (analyticsError) {
        console.error('Revenue analytics tracking error:', analyticsError);
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order create error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
