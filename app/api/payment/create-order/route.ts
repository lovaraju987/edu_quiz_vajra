
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Voucher from "@/models/Voucher";

// Lazy initialization
const getRazorpay = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_lazy_init_fallback',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'fallback_secret',
    });
};

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        console.log('Create Order Secure Request:', body);

        const { cartItems, voucherCode, currency = 'INR', receipt } = body;

        let finalAmount = 0;

        // 1. SECURITY: Calculate Price on Server
        if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
            console.log("🔒 Securing executing server-side price calculation...");

            // Fetch all products
            const productIds = cartItems.map((item: any) => item.productId);
            const products = await Product.find({ _id: { $in: productIds } });

            // Calculate Subtotal
            let subtotal = 0;
            cartItems.forEach((item: any) => {
                const product = products.find(p => p._id.toString() === item.productId);
                if (product) {
                    // Check both originalPrice and price for compatibility
                    subtotal += (product.originalPrice || product.price || 0) * (item.quantity || 1);
                }
            });

            console.log("💰 Server Calculated Subtotal:", subtotal);

            // Apply Voucher Discount
            if (voucherCode) {
                const voucher = await Voucher.findOne({ voucherCode: voucherCode.trim() });
                if (voucher && voucher.status === 'active') {
                    // Start date check if needed, but status is primary
                    const discount = (voucher.discountPercent || voucher.discountPercentage || 0) / 100;
                    const discountAmount = subtotal * discount;
                    finalAmount = subtotal - discountAmount;
                    console.log(`🎟️ Voucher Applied: ${voucherCode} (-${discount * 100}%) -> Final: ${finalAmount}`);
                } else {
                    console.warn(`⚠️ Invalid or inactive voucher used: ${voucherCode}`);
                    finalAmount = subtotal; // Fallback to full price
                }
            } else {
                finalAmount = subtotal;
            }

        } else if (body.amount) {
            // FALLBACK for legacy or direct calls - Only allowed if specifically enabled or strictly in dev
            // For strict security, we should REJECT this in production
            if (process.env.NODE_ENV === 'production') {
                console.error("🚨 BLOCKED attempts to set client-side price in production");
                return NextResponse.json({ error: "Invalid request format. Please update app." }, { status: 400 });
            }
            console.warn("⚠️ Client-side price accepted ONLY in Development Mode");
            finalAmount = body.amount;
        } else {
            return NextResponse.json({ error: "No items or amount provided" }, { status: 400 });
        }

        // 2. Handle Free Orders (Price = 0)
        if (finalAmount <= 0) {
            console.log("🎁 Free Order detected via Server Calculation");
            const freeOrder = {
                id: `order_free_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                amount: 0,
                currency: currency,
                receipt: receipt || `receipt_${Date.now()}`,
                status: 'paid', // Auto-complete free orders
                isMock: true
            };
            return NextResponse.json({
                ...freeOrder,
                orderId: freeOrder.id,
                keyId: 'free_order'
            });
        }

        // 3. Create Razorpay Order
        const options = {
            amount: Math.round(finalAmount * 100), // Convert to paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        try {
            const order = await getRazorpay().orders.create(options);
            return NextResponse.json({
                ...order,
                orderId: order.id,
                keyId: process.env.RAZORPAY_KEY_ID,
            });
        } catch (rzpError: any) {
            console.error('Razorpay SDK Error:', rzpError);
            if (process.env.NODE_ENV === 'development') {
                return NextResponse.json({
                    id: `order_mock_${Date.now()}`,
                    amount: options.amount,
                    currency: options.currency,
                    receipt: options.receipt,
                    status: 'created',
                    isMock: true,
                    orderId: `order_mock_${Date.now()}`,
                    keyId: 'rzp_test_mock_key',
                });
            }
            throw rzpError;
        }

    } catch (error: any) {
        console.error('Error in create-order:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create order' },
            { status: 500 }
        );
    }
}
