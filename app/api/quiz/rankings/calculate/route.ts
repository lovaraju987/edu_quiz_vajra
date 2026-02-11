import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizResult from '@/models/QuizResult';
import Voucher from '@/models/Voucher';
import { generateVoucherCode, calculateExpiryDate } from '@/lib/utils/voucherGenerator';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

        const results = await QuizResult.find({ date })
            .sort({ score: -1, timeTaken: 1 });

        if (results.length === 0) {
            return NextResponse.json({ message: 'No results found to process' });
        }

        const processedResults = [];
        const voucherOperations = [];

        for (let i = 0; i < results.length; i++) {
            const res = results[i];
            const rank = i + 1;

            res.rank = rank;
            processedResults.push(res.save());

            let discount = 0;
            if (rank <= 10) discount = 100;
            else if (rank <= 100) discount = 50;
            else if (rank <= 1000) discount = 25;

            if (discount > 0) {
                voucherOperations.push(Voucher.create({
                    code: generateVoucherCode(),
                    studentId: res.studentId,
                    studentName: res.studentName,
                    discountPercentage: discount,
                    expiry: calculateExpiryDate(7),
                    status: 'active',
                    type: 'quiz_reward'
                }));
            }
        }

        await Promise.all(processedResults);
        const vouchersCreated = await Promise.all(voucherOperations);

        return NextResponse.json({
            success: true,
            totalProcessed: results.length,
            vouchersGenerated: vouchersCreated.length
        });

    } catch (error: any) {
        console.error('Ranking Calculation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
