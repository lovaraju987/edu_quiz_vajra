import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    answerIndex: { type: Number, required: true },
    category: { type: String, required: true },
    level: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema, 'questions');

async function generateBatchViaRest(level, batchSize = 30) {
    const levelDescription = level === 1 ? "Classes 4 to 6 (Elementary level)" :
        level === 2 ? "Classes 7 and 8 (Intermediate level)" :
            "Classes 9 and 10 (High School level)";

    // Use v1beta for advanced features like JSON mode in newer models
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const body = {
        contents: [{
            parts: [{
                text: `You are an expert Indian school teacher. Generate exactly ${batchSize} unique and challenging multiple-choice questions for students in ${levelDescription}. 
                Ensure questions are academic and strictly follow these categories (distribute roughly equally): Health, Science, Sports, General Knowledge, History.
                
                IMPORTANT: Output the result STRICTLY as a raw JSON array of objects. Do not include markdown code blocks, do not include "json" text, just the raw array.
                Structure: [{"text": "Question?", "options": ["A", "B", "C", "D"], "answerIndex": 0, "category": "Science", "level": ${level}}]`
            }]
        }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API Error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidate) throw new Error("No content returned from Gemini");

    return JSON.parse(candidate);
}

async function forceRealSeed() {
    console.log('🚀 Starting REAL AI QUESTION GENERATION (STRICT COOLDOWN MODE)...');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📡 Connected to MongoDB');

        for (const level of [1, 2, 3]) {
            let allQuestions = [];
            const totalNeeded = 50;
            const batchSize = 10; // Very small batches to be safe
            const iterations = Math.ceil(totalNeeded / batchSize);

            console.log(`\n--- Level ${level}: Generating ${totalNeeded} questions (Slow Mode) ---`);

            for (let i = 0; i < iterations; i++) {
                let retries = 3;
                while (retries > 0) {
                    try {
                        console.log(`... Batch ${i + 1}/${iterations} (Attempt ${4 - retries})`);
                        const questions = await generateBatchViaRest(level, batchSize);

                        if (Array.isArray(questions) && questions.length > 0) {
                            allQuestions = [...allQuestions, ...questions];
                            console.log(`    ✅ Success: Added ${questions.length} questions.`);
                            break;
                        }
                    } catch (err) {
                        console.error(`    ❌ Batch Failed: ${err.message}`);
                        retries--;
                        if (retries > 0) {
                            console.log(`    ⏳ Quota hit? Waiting 90s before retry...`);
                            await new Promise(r => setTimeout(r, 90000));
                        }
                    }
                }
                // Wait longer to avoid rate limits
                console.log(`    ⏳ Cooling down 30s...`);
                await new Promise(r => setTimeout(r, 30000));
            }

            if (allQuestions.length > 0) {
                console.log(`Level ${level}: Deleting old and inserting ${allQuestions.length} real questions...`);
                await Question.deleteMany({ level });
                const res = await Question.insertMany(allQuestions);
                console.log(`✅ Level ${level} COMPLETE. Added ${res.length} real questions.`);
            }

            console.log(`    ⏳ Waiting 60s before starting next level...`);
            await new Promise(r => setTimeout(r, 60000));
        }

        console.log(`\n✨ OPERATION COMPLETE! ✨`);
        process.exit(0);
    } catch (error) {
        console.error('❌ CRITICAL FAIL:', error);
        process.exit(1);
    }
}

forceRealSeed();
