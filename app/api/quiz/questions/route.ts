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

        // --- SMART AI SEEDER REMOVED ---
        // Questions are now generated via background Cron Job (see lib/cron-scheduler.ts)
        // -------------------------------

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
                // Quiz hours: 8 AM to 8 PM (next available: tomorrow at 8 AM)
                const nextMorning = new Date(tomorrow);
                nextMorning.setHours(8, 0, 0, 0);
                const now = new Date();
                const hoursUntilNext = Math.ceil((nextMorning.getTime() - now.getTime()) / (1000 * 60 * 60));

                return NextResponse.json({
                    error: `🎯 Daily Quiz Completed! You can take your next quiz in ${hoursUntilNext} hours (tomorrow at 8:00 AM). Quiz hours: 8 AM - 8 PM. Coming back daily earns rewards! 🏆`,
                    nextAvailable: nextMorning.toISOString()
                }, { status: 403 });
            }

            // Update lastActiveAt as heartbeat
            const Student = (await import('@/models/Student')).default;
            await Student.updateOne({ idNo: idNo.toUpperCase() }, { lastActiveAt: new Date() });
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
