import cron from 'node-cron';
import dbConnect from './db';
import Question from '@/models/Question';
import { generateBatchQuestions } from './ai-generator';

export function initCronJob() {
    console.log('⏰ Initializing Daily Question Cron Job...');

    // Schedule: 0 8 * * * (At 08:00 AM)
    // Runs every day at 8:00 AM server time
    cron.schedule('0 8 * * *', async () => {
        console.log('🔄 STARTING DAILY QUESTION REGENERATION (8:00 AM)...');

        try {
            await dbConnect();

            // 1. Clear Old Questions
            console.log('🧹 Clearing old questions...');
            await Question.deleteMany({});
            console.log('✅ Old questions cleared.');

            // 2. Generate New Questions for All Levels
            const levels = [1, 2, 3];

            for (const level of levels) {
                console.log(`🚀 Generating questions for Level ${level}...`);
                const questions = await generateBatchQuestions(level, 200); // 200 questions per level

                if (questions && questions.length > 0) {
                    await Question.insertMany(questions);
                    console.log(`✅ Successfully seeded ${questions.length} questions for Level ${level}.`);
                } else {
                    console.error(`❌ Failed to generate questions for Level ${level}.`);
                }
            }

            console.log('✨ DAILY QUESTION REGENERATION COMPLETE! ✨');

        } catch (error) {
            console.error('❌ CRON JOB FAILED:', error);
        }
    });

    // Run immediately on server start if DB is empty (First Setup)
    // This ensures there are questions right away, even before 8 AM
    setTimeout(async () => {
        try {
            await dbConnect();
            const count = await Question.countDocuments();
            if (count === 0) {
                console.log('⚠️ Database empty on startup. Triggering immediate generation...');
                const levels = [1, 2, 3];
                for (const level of levels) {
                    const questions = await generateBatchQuestions(level, 50); // Smaller batch for quick startup
                    await Question.insertMany(questions);
                }
                console.log('✅ Immediate startup seeding complete.');
            }
        } catch (error) {
            console.error('Startup check failed:', error);
        }
    }, 5000); // Wait 5s for DB connection to stabilize
}
