import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Question from '@/models/Question';

export async function GET(req: Request) {
    try {
        const isDbConnected = await dbConnect();

        // MOCK MODE FALLBACK
        if (isDbConnected === false) {
            console.log("Serving mock questions (MOCK MODE)");
            const mockQuestions = [
                { text: "What is 10 + 15?", options: ["20", "25", "30", "35"], answerIndex: 1, category: "Math" },
                { text: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answerIndex: 1, category: "Science" },
                { text: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], answerIndex: 1, category: "GK" },
                { text: "What is the capital of India?", options: ["Mumbai", "Delhi", "Kolkata", "Chennai"], answerIndex: 1, category: "GK" },
                { text: "Which is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answerIndex: 3, category: "Science" },
                { text: "What do bees collect to make honey?", options: ["Nectar", "Water", "Sap", "Pollen"], answerIndex: 0, category: "Science" },
                { text: "Which year did India get independence?", options: ["1942", "1945", "1947", "1950"], answerIndex: 2, category: "History" },
                { text: "What is the boiling point of water?", options: ["90°C", "100°C", "110°C", "120°C"], answerIndex: 1, category: "Science" },
                { text: "How many colors are in a rainbow?", options: ["5", "6", "7", "8"], answerIndex: 2, category: "Science" },
                { text: "Who is the 'King of Fruits' in India?", options: ["Apple", "Mango", "Banana", "Grapes"], answerIndex: 1, category: "Health" }
            ];
            return NextResponse.json(mockQuestions);
        }

        const { searchParams } = new URL(req.url);
        const level = parseInt(searchParams.get('level') || '1');
        const idNo = searchParams.get('idNo');

        // --- SECURITY: Check for Daily Attempt ---
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
                const nextMorning = new Date(tomorrow);
                nextMorning.setHours(8, 0, 0, 0);
                const now = new Date();
                const hoursUntilNext = Math.ceil((nextMorning.getTime() - now.getTime()) / (1000 * 60 * 60));

                return NextResponse.json({
                    error: `🎯 Daily Quiz Completed! You can take your next quiz in ${hoursUntilNext} hours (tomorrow at 8:00 AM).`,
                    nextAvailable: nextMorning.toISOString()
                }, { status: 403 });
            }

            const Student = (await import('@/models/Student')).default;
            await Student.updateOne({ idNo: idNo.toUpperCase() }, { lastActiveAt: new Date() });
        }

        const categories = ['Health', 'Science', 'Sports', 'GK', 'History'];
        let finalizedQuestions: any[] = [];
        const usedIds: any[] = [];

        for (const category of categories) {
            let categoryQuestions = await Question.aggregate([
                { $match: { level, category, _id: { $nin: usedIds } } },
                { $sample: { size: 5 } }
            ]);

            if (categoryQuestions.length < 5) {
                const needed = 5 - categoryQuestions.length;
                const extras = await Question.aggregate([
                    { $match: { level, _id: { $nin: [...usedIds, ...categoryQuestions.map(q => q._id)] } } },
                    { $sample: { size: needed } }
                ]);
                const relabeledExtras = extras.map(q => ({ ...q, category }));
                categoryQuestions = [...categoryQuestions, ...relabeledExtras];
            }

            // Ultimate fallback from ANY level
            if (categoryQuestions.length < 5) {
                const needed = 5 - categoryQuestions.length;
                const extras = await Question.aggregate([
                    { $match: { _id: { $nin: [...usedIds, ...categoryQuestions.map(q => q._id)] } } },
                    { $sample: { size: needed } }
                ]);
                const relabeledExtras = extras.map(q => ({ ...q, category }));
                categoryQuestions = [...categoryQuestions, ...relabeledExtras];
            }

            finalizedQuestions = [...finalizedQuestions, ...categoryQuestions];
            usedIds.push(...categoryQuestions.map(q => q._id));
        }

        return NextResponse.json(finalizedQuestions.slice(0, 25));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
