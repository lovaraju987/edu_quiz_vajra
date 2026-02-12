import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

<<<<<<< HEAD
/**
 * GET /api/products
 * Get all active products for voucher redemption
 * Query params: category (optional)
 */
export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        const query: any = { isActive: true };
        if (category) {
            query.category = category;
        }

        const products = await Product.find(query).sort({ createdAt: -1 });

        return NextResponse.json({
            products,
            count: products.length
        });

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
 * Body: { productName, description, category, originalPrice, imageUrl, brand, stock }
 */
export async function POST(req: Request) {
    try {
        await dbConnect();

        const data = await req.json();

        const product = await Product.create(data);

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
=======
export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        let query = {};
        if (category && category !== 'All') {
            query = { category };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ products });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const product = await Product.create(body);
        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
>>>>>>> devepment-v/screen-compatibility
    }
}
