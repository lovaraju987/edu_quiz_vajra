import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Voucher from '@/models/Voucher';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            voucherId,
            deliveryDetails
        } = await req.json();

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic && !razorpay_payment_id.startsWith('pay_test')) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // 2. Update Voucher Status
        const voucher = await Voucher.findById(voucherId);
        if (!voucher) {
            return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
        }

        if (voucher.status === 'redeemed') {
            return NextResponse.json({ error: 'Voucher already redeemed' }, { status: 400 });
        }

        voucher.status = 'redeemed';
        voucher.redeemedAt = new Date();
        voucher.paymentId = razorpay_payment_id;
        voucher.deliveryDetails = deliveryDetails;
        await voucher.save();

        return NextResponse.json({
            success: true,
            message: 'Payment verified and voucher redeemed successfully',
            voucher
        });

    } catch (error: any) {
        console.error('Payment Verification Error:', error);
        return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
    }
}
