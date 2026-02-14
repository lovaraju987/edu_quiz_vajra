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
            // Support both HEAD and Incoming parameter names
            voucherCode,
            voucherId,
            productId,
            cartItems,
            deliveryAddress,
            deliveryDetails
        } = await req.json();

        // Harmonize inputs
        const targetVoucherCode = voucherCode;
        const targetVoucherId = voucherId;
        const finalDeliveryDetails = deliveryAddress || deliveryDetails;

        // Verify payment signature
        let isAuthentic = false;

        // Bypass for mock orders in development or free orders
        if (razorpay_order_id.startsWith('order_mock_') || razorpay_order_id.startsWith('order_free_')) {
            console.log('MOCK/FREE ORDER DETECTED - BYPASSING SIGNATURE VERIFICATION');
            isAuthentic = true;
        } else {
            const sign = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSign = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
                .update(sign.toString())
                .digest('hex');

            isAuthentic = razorpay_signature === expectedSign;
        }

        if (!isAuthentic && !razorpay_payment_id.startsWith('pay_test')) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // ---------------------------------------------------------
        // TEST VOUCHERS (Bypass Database Redemption)
        // ---------------------------------------------------------
        const testCodes = ['QUIZ2024-TEST001', 'QUIZ2024-TEST002', 'QUIZ2024-TEST003'];
        if (targetVoucherCode && testCodes.includes(targetVoucherCode.toUpperCase())) {
            return NextResponse.json({
                success: true,
                message: 'Test Payment verified successfully!',
                voucher: {
                    voucherCode: targetVoucherCode.toUpperCase(),
                    redeemedAt: new Date(),
                    paymentId: razorpay_payment_id,
                    isTest: true
                }
            });
        }
        // ---------------------------------------------------------

        // Find Voucher
        let voucher;
        if (targetVoucherCode) {
            voucher = await Voucher.findOne({ voucherCode: targetVoucherCode });
        } else if (targetVoucherId) {
            voucher = await Voucher.findById(targetVoucherId);
        }

        if (!voucher) {
            return NextResponse.json(
                { error: 'Invalid voucher code or ID' },
                { status: 404 }
            );
        }

        if (voucher.status === 'redeemed' || voucher.isRedeemed) {
            return NextResponse.json(
                { error: 'Voucher has already been redeemed' },
                { status: 400 }
            );
        }

        if (new Date() > new Date(voucher.expiryDate || voucher.expiry)) {
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
        voucher.status = 'redeemed';

        // Save Payment Details
        voucher.paymentId = razorpay_payment_id;
        voucher.orderId = razorpay_order_id;

        // Save Usage Details
        if (productId) voucher.redeemedProduct = productId;
        if (finalDeliveryDetails) {
            voucher.deliveryAddress = finalDeliveryDetails;
            voucher.deliveryDetails = finalDeliveryDetails; // Backwards compat
        }
        if (cartItems) voucher.cartItems = cartItems;

        await voucher.save();

        return NextResponse.json({
            success: true,
            message: 'Payment verified and voucher redeemed successfully!',
            voucher: {
                voucherCode: voucher.voucherCode || voucher.code,
                redeemedAt: voucher.redeemedAt,
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id
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
