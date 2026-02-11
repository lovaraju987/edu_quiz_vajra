import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizResult from '@/models/QuizResult';
import Voucher from '@/models/Voucher';
import { isResultAvailable, getTimeUntilResults } from '@/lib/utils/timeCheck';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');
        const date = searchParams.get('date');

        if (!studentId || !date) {
            return NextResponse.json({ error: 'Student ID and date required' }, { status: 400 });
        }

        if (!isResultAvailable()) {
            return NextResponse.json({
                available: false,
                message: 'Results will be declared at 8:30 PM',
                timing: getTimeUntilResults()
            });
        }

        const result = await QuizResult.findOne({
            studentId: studentId.toUpperCase(),
            date: date
        });

        if (!result) {
            return NextResponse.json({ available: false, message: 'No quiz record found for today' });
        }

        const voucher = await Voucher.findOne({
            studentId: studentId.toUpperCase(),
            type: 'quiz_reward',
            createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lte: new Date(new Date().setHours(23, 59, 59, 999))
            }
        });

        return NextResponse.json({
            available: true,
            result,
            voucher: voucher || null
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
