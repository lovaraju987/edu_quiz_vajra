import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizResult from '@/models/QuizResult';
import Voucher from '@/models/Voucher';
import { generateVoucherCode, calculateVoucherExpiry } from '@/lib/utils/voucherGenerator';

/**
 * POST /api/quiz/rankings/calculate
 * Calculate rankings for all quiz results of a specific date
 * This should be called by cron job at 8:30 PM daily
 */
export async function POST(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date');

        // Use provided date or today
        const quizDate = dateParam ? new Date(dateParam) : new Date();
        quizDate.setHours(0, 0, 0, 0); // Start of day

        const nextDay = new Date(quizDate);
        nextDay.setDate(nextDay.getDate() + 1);

        console.log(`🏆 Calculating rankings for ${quizDate.toDateString()}...`);

        // Get all quiz results for this date, sorted by score (desc) and timeTaken (asc)
        const results = await QuizResult.find({
            attemptDate: {
                $gte: quizDate,
                $lt: nextDay
            }
        }).sort({ score: -1, timeTaken: 1 }); // Higher score first, then faster time

        if (results.length === 0) {
            console.log('⚠️ No quiz results found for this date');
            return NextResponse.json({
                message: 'No quiz results found for this date',
                date: quizDate.toDateString(),
                rankedCount: 0,
                vouchersGenerated: 0
            });
        }

        console.log(`📊 Found ${results.length} quiz results to rank`);

        // Assign ranks
        let currentRank = 1;
        let vouchersGenerated = 0;
        const bulkOps = [];
        const voucherBulkOps = [];

        for (let i = 0; i < results.length; i++) {
            const result = results[i];

            // Handle ties: same score and time = same rank
            if (i > 0) {
                const prevResult = results[i - 1];
                if (result.score !== prevResult.score || result.timeTaken !== prevResult.timeTaken) {
                    currentRank = i + 1;
                }
            }

            // Update result with rank
            bulkOps.push({
                updateOne: {
                    filter: { _id: result._id },
                    update: {
                        $set: {
                            rank: currentRank,
                            rankCalculatedAt: new Date()
                        }
                    }
                }
            });

            // Generate voucher for ranks 101-10,000
            if (currentRank > 100 && currentRank <= 10000) {
                // Check if voucher already exists
                const existingVoucher = await Voucher.findOne({
                    studentId: result.studentId,
                    quizDate: {
                        $gte: quizDate,
                        $lt: nextDay
                    }
                });

                if (!existingVoucher) {
                    const voucherCode = generateVoucherCode();
                    const expiryDate = calculateVoucherExpiry();

                    voucherBulkOps.push({
                        insertOne: {
                            document: {
                                voucherCode,
                                studentId: result.studentId,
                                studentName: result.studentName,
                                idNo: result.idNo,
                                discountPercent: 50,
                                generatedDate: new Date(),
                                expiryDate,
                                isRedeemed: false,
                                status: 'active',
                                quizDate: result.attemptDate,
                                rank: currentRank
                            }
                        }
                    });

                    vouchersGenerated++;
                }
            }
        }

        // Execute bulk operations
        if (bulkOps.length > 0) {
            await QuizResult.bulkWrite(bulkOps);
            console.log(`✅ Updated ${bulkOps.length} quiz results with ranks`);
        }

        if (voucherBulkOps.length > 0) {
            await Voucher.bulkWrite(voucherBulkOps);
            console.log(`🎁 Generated ${vouchersGenerated} new vouchers`);
        }

        // Get top 100 for logging
        const top100 = results.slice(0, Math.min(100, results.length));
        console.log(`🏆 Top 100 students ranked (${top100.length} total)`);

        return NextResponse.json({
            message: 'Rankings calculated successfully',
            date: quizDate.toDateString(),
            rankedCount: results.length,
            vouchersGenerated,
            top100Count: top100.length,
            voucherEligibleCount: results.filter((_, i) => i >= 100 && i < 10000).length
        });

    } catch (error: any) {
        console.error('❌ Error calculating rankings:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to calculate rankings' },
            { status: 500 }
        );
    }
}
