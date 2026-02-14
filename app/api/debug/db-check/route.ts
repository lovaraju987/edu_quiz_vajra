import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Question from '@/models/Question';
import QuizResult from '@/models/QuizResult'; // Assuming this model exists

export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const idNo = searchParams.get('idNo');

        const questionCounts = await Question.aggregate([
            {
                $group: {
                    _id: { level: "$level", category: "$category" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.level": 1, "_id.category": 1 } }
        ]);

        const totalQuestions = await Question.countDocuments();

        let studentStatus = "No ID provided";
        if (idNo) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const attempt = await QuizResult.findOne({
                idNo: idNo.toUpperCase(),
                attemptDate: { $gte: today, $lt: tomorrow }
            });
            studentStatus = attempt ? "Attempt found for today" : "No attempt found for today";
        }

        return NextResponse.json({
            status: "Debug Info",
            totalQuestions,
            breakdown: questionCounts,
            studentStatus,
            envMongoURI: process.env.MONGODB_URI ? "Present" : "Missing"
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
