import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Voucher from '@/models/Voucher';
import Product from '@/models/Product';
import { generateVoucherCode, calculateExpiryDate } from '@/lib/utils/voucherGenerator';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
        }

        const vouchers = await Voucher.find({
            studentId: studentId.toUpperCase()
        }).sort({ createdAt: -1 });

        return NextResponse.json({ vouchers });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { studentId, studentName, discountPercentage, type } = await req.json();

        const voucher = await Voucher.create({
            code: generateVoucherCode(),
            studentId: studentId.toUpperCase(),
            studentName,
            discountPercentage: discountPercentage || 10,
            expiry: calculateExpiryDate(30),
            status: 'active',
            type: type || 'quiz_reward'
        });

        return NextResponse.json(voucher, { status: 201 });
    } catch (error: any) {
        console.error('Voucher Creation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const { voucherId, productId, deliveryDetails } = await req.json();

        const voucher = await Voucher.findById(voucherId);
        if (!voucher) return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
        if (voucher.status !== 'active') return NextResponse.json({ error: 'Voucher not active' }, { status: 400 });

        const product = await Product.findById(productId);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        voucher.status = 'redeemed';
        voucher.productId = productId;
        voucher.redeemedAt = new Date();
        voucher.deliveryDetails = deliveryDetails;
        await voucher.save();

        return NextResponse.json({ success: true, voucher });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
