import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizResult from '@/models/QuizResult';
import Voucher from '@/models/Voucher';
import { isResultsAvailable, getResultsReleaseTime } from '@/lib/utils/timeCheck';

/**
 * GET /api/quiz/results
 * Fetch quiz results for a student with 8:30 PM timing control
 * Query params: studentId, date (optional, defaults to today)
 */
export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');
        const dateParam = searchParams.get('date');

        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID is required' },
                { status: 400 }
            );
        }

        // Parse date or use today
        const quizDate = dateParam ? new Date(dateParam) : new Date();
        quizDate.setHours(0, 0, 0, 0); // Start of day

        const nextDay = new Date(quizDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Find quiz result for this student on this date
        const result = await QuizResult.findOne({
            studentId,
            attemptDate: {
                $gte: quizDate,
                $lt: nextDay
            }
        });

        if (!result) {
            return NextResponse.json({
                available: false,
                message: 'No quiz attempt found for this date'
            });
        }

        // Check if results are available (after 8:30 PM)
        const resultsAvailable = isResultsAvailable(result.attemptDate);
        const releaseTime = getResultsReleaseTime(result.attemptDate);

        if (!resultsAvailable) {
            return NextResponse.json({
                available: false,
                releaseTime: releaseTime.toISOString(),
                message: 'Results will be available at 8:30 PM'
            });
        }

        // Results are available - fetch voucher if applicable
        let voucher = null;
        if (result.rank && result.rank > 100 && result.rank <= 10000) {
            voucher = await Voucher.findOne({
                studentId,
                quizDate: {
                    $gte: quizDate,
                    $lt: nextDay
                },
                status: { $in: ['active', 'redeemed'] }
            });
        }

        return NextResponse.json({
            available: true,
            result: {
                score: result.score,
                totalQuestions: result.totalQuestions,
                percentage: Math.round((result.score / result.totalQuestions) * 100),
                rank: result.rank,
                timeTaken: result.timeTaken,
                attemptDate: result.attemptDate,
                level: result.level
            },
            voucher: voucher ? {
                voucherCode: voucher.voucherCode,
                discountPercent: voucher.discountPercent,
                expiryDate: voucher.expiryDate,
                status: voucher.status,
                isRedeemed: voucher.isRedeemed
            } : null,
            eligibility: {
                isTop100: result.rank && result.rank <= 100,
                hasVoucher: result.rank && result.rank > 100 && result.rank <= 10000,
                scholarshipEligible: result.rank && result.rank <= 100
            }
        });

    } catch (error: any) {
        console.error('Error fetching quiz results:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch results' },
            { status: 500 }
        );
    }
}
