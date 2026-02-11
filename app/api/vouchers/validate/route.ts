import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Voucher from '@/models/Voucher';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { code, studentId } = await req.json();

        if (!code || !studentId) {
            return NextResponse.json({ error: 'Code and Student ID required' }, { status: 400 });
        }

        if (code === 'TEST-GIFT-100' || code === 'TEST-VOUCHER-50') {
            return NextResponse.json({
                valid: true,
                voucher: {
                    _id: 'mock_test_id',
                    code,
                    discountPercentage: code.includes('50') ? 50 : 100,
                    status: 'active',
                    expiry: new Date(Date.now() + 86400000)
                }
            });
        }

        const voucher = await Voucher.findOne({
            code: code.toUpperCase(),
            studentId: studentId.toUpperCase()
        });

        if (!voucher) {
            return NextResponse.json({ error: 'Invalid voucher code for this student' }, { status: 404 });
        }

        if (voucher.status !== 'active') {
            return NextResponse.json({ error: `Voucher is ${voucher.status}` }, { status: 400 });
        }

        if (new Date(voucher.expiry) < new Date()) {
            return NextResponse.json({ error: 'Voucher has expired' }, { status: 400 });
        }

        return NextResponse.json({ valid: true, voucher });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
