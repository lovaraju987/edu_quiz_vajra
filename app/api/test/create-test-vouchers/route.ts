import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Voucher from '@/models/Voucher';

// Create test vouchers
export async function POST(req: Request) {
    try {
        await dbConnect();

        const testVouchers = [
            {
                voucherCode: 'QUIZ2024-TEST001',
                studentId: 'TEST001',
                studentName: 'Test Student 1',
                idNo: 'TEST001',
                discountPercent: 50,
                generatedDate: new Date(),
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                isRedeemed: false,
                status: 'active',
                quizDate: new Date(),
                rank: 150
            },
            {
                voucherCode: 'QUIZ2024-TEST002',
                studentId: 'TEST002',
                studentName: 'Test Student 2',
                idNo: 'TEST002',
                discountPercent: 50,
                generatedDate: new Date(),
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isRedeemed: false,
                status: 'active',
                quizDate: new Date(),
                rank: 250
            },
            {
                voucherCode: 'QUIZ2024-TEST003',
                studentId: 'TEST003',
                studentName: 'Test Student 3',
                idNo: 'TEST003',
                discountPercent: 50,
                generatedDate: new Date(),
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isRedeemed: false,
                status: 'active',
                quizDate: new Date(),
                rank: 500
            }
        ];

        // Delete existing test vouchers
        await Voucher.deleteMany({ studentId: { $in: ['TEST001', 'TEST002', 'TEST003'] } });

        // Create new test vouchers
        const created = await Voucher.insertMany(testVouchers);

        return NextResponse.json({
            message: 'Test vouchers created successfully',
            count: created.length,
            vouchers: created
        });

    } catch (error: any) {
        console.error('Error creating test vouchers:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
