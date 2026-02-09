import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Voucher from '@/models/Voucher';

export async function POST(req: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            voucherCode,
            productId,
            cartItems,
            deliveryAddress
        } = await req.json();

        // Verify payment signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // ---------------------------------------------------------
        // TEST VOUCHERS (Bypass Database Redemption)
        // ---------------------------------------------------------
        const testCodes = ['QUIZ2024-TEST001', 'QUIZ2024-TEST002', 'QUIZ2024-TEST003'];
        if (testCodes.includes(voucherCode.toUpperCase())) {
            return NextResponse.json({
                success: true,
                message: 'Test Payment verified successfully!',
                voucher: {
                    voucherCode: voucherCode.toUpperCase(),
                    redeemedAt: new Date(),
                    paymentId: razorpay_payment_id,
                    isTest: true
                }
            });
        }
        // ---------------------------------------------------------

        // Payment verified successfully, now redeem voucher
        await dbConnect();

        const voucher = await Voucher.findOne({ voucherCode });

        if (!voucher) {
            return NextResponse.json(
                { error: 'Invalid voucher code' },
                { status: 404 }
            );
        }

        if (voucher.isRedeemed) {
            return NextResponse.json(
                { error: 'Voucher has already been redeemed' },
                { status: 400 }
            );
        }

        if (new Date() > new Date(voucher.expiryDate)) {
            voucher.status = 'expired';
            await voucher.save();
            return NextResponse.json(
                { error: 'Voucher has expired' },
                { status: 400 }
            );
        }

        // Redeem voucher
        voucher.isRedeemed = true;
        voucher.redeemedAt = new Date();
        voucher.redeemedProduct = productId;
        voucher.status = 'redeemed';
        voucher.paymentId = razorpay_payment_id;
        voucher.orderId = razorpay_order_id;
        voucher.deliveryAddress = deliveryAddress;
        voucher.cartItems = cartItems;
        await voucher.save();

        return NextResponse.json({
            success: true,
            message: 'Payment successful and order placed!',
            voucher: {
                voucherCode: voucher.voucherCode,
                redeemedAt: voucher.redeemedAt,
                paymentId: razorpay_payment_id
            }
        });

    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
