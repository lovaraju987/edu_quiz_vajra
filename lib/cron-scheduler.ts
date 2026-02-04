import cron from 'node-cron';
import dbConnect from './db';
import Question from '@/models/Question';
import { generateBatchQuestions } from './ai-generator';

export function initCronJob() {
    console.log('⏰ Initializing Daily Question Cron Job...');

    // Schedule: 0 4 * * * (At 04:00 AM)
    // Runs every day at 4:00 AM server time
    cron.schedule('0 4 * * *', async () => {
        console.log('🔄 STARTING DAILY QUESTION REGENERATION (4:00 AM)...');

        try {
            await dbConnect();

            // CRITICAL: Generate ALL new questions FIRST before deleting old ones
            // This ensures DB is never empty if generation fails
            const levels = [1, 2, 3];
            let allNewQuestions: any[] = [];
            let generationSuccess = true;

            for (const level of levels) {
                console.log(`🚀 Generating questions for Level ${level}...`);
                const questions = await generateBatchQuestions(level, 150); // 150 questions per level (Total 450)

                if (questions && questions.length > 0) {
                    // Add level metadata to each question for batch insert
                    allNewQuestions.push(...questions);
                    console.log(`✅ Generated ${questions.length} questions for Level ${level}.`);
                } else {
                    console.error(`❌ Failed to generate questions for Level ${level}.`);
                    generationSuccess = false;
                    break; // Stop if any level fails
                }
            }

            // Only clear old questions and insert new ones if ALL generations succeeded
            if (generationSuccess && allNewQuestions.length >= 400) { // Require at least 400/450 questions
                console.log('🧹 Clearing old questions...');
                await Question.deleteMany({});
                console.log('✅ Old questions cleared.');

                await Question.insertMany(allNewQuestions);
                console.log(`✅ Successfully seeded ${allNewQuestions.length} new questions.`);
                console.log('✨ DAILY QUESTION REGENERATION COMPLETE! ✨');
            } else {
                console.error('❌ Generation incomplete. Keeping old questions to prevent empty database.');
                console.error(`Generated: ${allNewQuestions.length}/450 questions. Minimum required: 400.`);
            }

        } catch (error) {
            console.error('❌ CRON JOB FAILED:', error);
            console.error('⚠️ Old questions preserved to keep platform operational.');
        }
    });

    // Run immediately on server start if DB is empty (First Setup)
    // This ensures there are questions right away, even before the 4:00 AM cycle
    setTimeout(async () => {
        try {
            await dbConnect();
            const count = await Question.countDocuments();
            if (count === 0) {
                console.log('⚠️ Database empty on startup. Triggering full AI generation (450 questions)...');
                const levels = [1, 2, 3];
                for (const level of levels) {
                    console.log(`... Startup Generation for Level ${level}`);
                    const questions = await generateBatchQuestions(level, 150);
                    if (questions && questions.length > 0) {
                        await Question.insertMany(questions);
                    }
                }
                console.log('✅ Plug-and-Play startup seeding complete.');
            } else {
                console.log(`📊 DB Check: ${count} questions found. No emergency seeding needed.`);
            }
        } catch (error) {
            console.error('Startup check failed:', error);
        }
    }, 5000);
}
