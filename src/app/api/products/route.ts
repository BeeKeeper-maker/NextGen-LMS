import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/products?tenantId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    const where = tenantId ? { tenantId, isActive: true } : { isActive: true };

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Parse features JSON for each product
    const enrichedProducts = products.map((product) => ({
      ...product,
      features: product.features ? JSON.parse(product.features) : [],
      metadata: product.metadata ? JSON.parse(product.metadata) : {},
    }));

    return NextResponse.json(enrichedProducts);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products - Create a product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, name, description, type, price, compareAtPrice, currency, isActive, features, metadata } = body;

    if (!tenantId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, name, price' },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        tenantId,
        name,
        description: description || null,
        type: type || 'course',
        price,
        compareAtPrice: compareAtPrice || null,
        currency: currency || 'USD',
        isActive: isActive ?? true,
        features: features ? JSON.stringify(features) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({
      ...product,
      features: product.features ? JSON.parse(product.features) : [],
      metadata: product.metadata ? JSON.parse(product.metadata) : {},
    }, { status: 201 });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
