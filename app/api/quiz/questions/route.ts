import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Question from '@/models/Question';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const level = parseInt(searchParams.get('level') || '1');

        // --- SMART AI SEEDER: Check if questions exist for this level ---
        let existingCount = await Question.countDocuments({ level });

        if (existingCount < 25) {
            console.log(`Found only ${existingCount} questions for Level ${level}. Re-seeding to reach 25... 🤖`);

            // Delete existing ones for this level to avoid duplicates during re-seed
            await Question.deleteMany({ level });

            const { generateDailyQuestions } = await import('@/lib/ai-generator');
            let aiQuestions = await generateDailyQuestions(level);

            if (!aiQuestions || aiQuestions.length === 0) {
                console.log("AI Generation failed. Using Fallback Question Pool. 📚");
                const { fallbackQuestions } = await import('@/lib/question-pool');
                // Adjust fallback questions to current level
                aiQuestions = fallbackQuestions.map(q => ({ ...q, level }));
            }

            if (aiQuestions && aiQuestions.length > 0) {
                await Question.insertMany(aiQuestions);
                console.log(`Successfully seeded ${aiQuestions.length} questions for Level ${level}.`);
            } else if (existingCount === 0) {
                // Only error out if we have absolutely 0 questions and seeding failed
                return NextResponse.json({ error: 'Failed to generate questions. Please try again later.' }, { status: 503 });
            }
        }
        // ----------------------------------------------------------------

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
