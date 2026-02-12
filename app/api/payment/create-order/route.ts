import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('Create Order Request Body:', body);
        const { amount, currency = 'INR', receipt } = body;

        if (!amount || amount < 0.01) {
            console.warn('Invalid amount received:', amount);
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        console.log('Creating Razorpay order with options:', options);

        try {
            const order = await razorpay.orders.create(options);
            console.log('Razorpay Order Created:', order.id);

            // Return a custom object with keyId included for the frontend
            return NextResponse.json({
                ...order,
                orderId: order.id,
                keyId: process.env.RAZORPAY_KEY_ID,
            });
        } catch (rzpError: any) {
            console.error('Razorpay SDK Error:', rzpError);

            // MOCK MODE FALLBACK if Razorpay is unreachable
            if (process.env.NODE_ENV === 'development') {
                console.log('RAZORPAY UNREACHABLE - ENABLING MOCK PAYMENT MODE');
                const mockOrder = {
                    id: `order_mock_${Date.now()}`,
                    amount: options.amount,
                    currency: options.currency,
                    receipt: options.receipt,
                    status: 'created',
                    isMock: true
                };
                return NextResponse.json({
                    ...mockOrder,
                    orderId: mockOrder.id,
                    keyId: 'rzp_test_mock_key',
                });
            }
            throw rzpError;
        }

    } catch (error: any) {
        console.error('Error in create-order API:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create payment order' },
            { status: 500 }
        );
    }
}
