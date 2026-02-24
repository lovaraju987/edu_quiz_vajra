import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { withCache, cacheDelete, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

/**
 * GET /api/products
 * Get all active products for voucher redemption
 */
export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        // ✅ IN-MEMORY CACHE: Only cache the full product list (no category filter)
        // Category-filtered requests are rare — not worth the cache complexity
        if (!category) {
            const products = await withCache(
                CACHE_KEYS.PRODUCTS_ALL,
                CACHE_TTL.PRODUCTS,
                async () => {
                    return Product.find({ isActive: true }).sort({ createdAt: -1 }).lean();
                }
            );
            return NextResponse.json({ products, count: products.length });
        }

        // Category filter — fetch fresh (no cache for filtered queries)
        const products = await Product.find({ isActive: true, category }).sort({ createdAt: -1 });
        return NextResponse.json({ products, count: products.length });

    } catch (error: any) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/products
 * Create a new product (Admin only)
 */
export async function POST(req: Request) {
    try {
        await dbConnect();

        const data = await req.json();
        const product = await Product.create(data);

        // ✅ INVALIDATE CACHE: New product added → clear so it shows up immediately
        cacheDelete(CACHE_KEYS.PRODUCTS_ALL);

        return NextResponse.json({
            message: 'Product created successfully',
            product
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create product' },
            { status: 500 }
        );
    }
}

