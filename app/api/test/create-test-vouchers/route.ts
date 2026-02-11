import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Voucher from '@/models/Voucher';
import { generateVoucherCode, calculateExpiryDate } from '@/lib/utils/voucherGenerator';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { studentId, count = 1, discount = 50 } = await req.json();

        if (!studentId) {
            return NextResponse.json({ error: 'studentId required' }, { status: 400 });
        }

        const vouchers = [];
        for (let i = 0; i < count; i++) {
            vouchers.push({
                code: generateVoucherCode("TEST"),
                studentId: studentId.toUpperCase(),
                studentName: "Test Student",
                discountPercentage: discount,
                expiry: calculateExpiryDate(30),
                status: 'active',
                type: 'quiz_reward'
            });
        }

        const createdVouchers = await Voucher.insertMany(vouchers);

        return NextResponse.json({
            message: `${count} test vouchers created`,
            vouchers: createdVouchers
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
