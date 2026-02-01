import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Question from '@/models/Question';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const levelStr = searchParams.get('level');
        const level = levelStr ? parseInt(levelStr) : 1;

        const categories = ['Health', 'Science', 'Sports', 'GK', 'History'];
        let allQuestions: any[] = [];

        // --- SECURITY: Check for Daily Attempt ---
        const idNo = searchParams.get('idNo');
        if (idNo) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const QuizResult = (await import('@/models/QuizResult')).default;
            const existingAttempt = await QuizResult.findOne({
                idNo: idNo.toUpperCase(),
                attemptDate: { $gte: today, $lt: tomorrow }
            });

            if (existingAttempt) {
                return NextResponse.json({ error: 'Already attempted today' }, { status: 403 });
            }
        }
        // ----------------------------------------

        // Fetch 5 random questions for each category
        for (const category of categories) {
            const categoryQuestions = await Question.aggregate([
                { $match: { level, category } },
                { $sample: { size: 5 } }
            ]);

            allQuestions = [...allQuestions, ...categoryQuestions];
        }

        // If we don't have enough questions for a category, fill with random ones from the same level
        if (allQuestions.length < 25) {
            const remainingSize = 25 - allQuestions.length;
            const existingIds = allQuestions.map(q => q._id);

            const extraQuestions = await Question.aggregate([
                { $match: { level, _id: { $nin: existingIds } } },
                { $sample: { size: remainingSize } }
            ]);

            allQuestions = [...allQuestions, ...extraQuestions];
        }

        // Final shuffle
        allQuestions.sort(() => Math.random() - 0.5);

        return NextResponse.json(allQuestions.slice(0, 25));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
