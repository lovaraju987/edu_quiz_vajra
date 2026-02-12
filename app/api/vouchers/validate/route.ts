import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Voucher from '@/models/Voucher';

export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: 'Voucher code required' }, { status: 400 });
        }

        // ---------------------------------------------------------
        // TEST VOUCHERS (Bypass Database)
        // ---------------------------------------------------------
        const testCodes = ['QUIZ2024-TEST001', 'QUIZ2024-TEST002', 'QUIZ2024-TEST003'];
        if (testCodes.includes(code.toUpperCase())) {
            return NextResponse.json({
                success: true,
                voucher: {
                    voucherCode: code.toUpperCase(),
                    discountPercent: 50, // Static 50% discount for tests
                    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Expires in 1 year
                    status: 'active',
                    isRedeemed: false
                }
            });
        }
        // ---------------------------------------------------------

        // Find voucher by code
        const voucher = await Voucher.findOne({
            voucherCode: code.toUpperCase(),
            status: 'active',
            isRedeemed: false
        });

        if (!voucher) {
            return NextResponse.json({
                error: 'Invalid or expired voucher code'
            }, { status: 404 });
        }

        // Check if voucher is expired
        if (new Date() > new Date(voucher.expiryDate)) {
            return NextResponse.json({
                error: 'This voucher has expired'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            voucher
        });

    } catch (error: any) {
        console.error('Error validating voucher:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
