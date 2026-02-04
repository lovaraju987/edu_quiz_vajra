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

async function generateGenuineBatch(level, count = 10) {
    const levelDesc = level === 1 ? "Class 4-6" : level === 2 ? "Class 7-8" : "Class 9-10";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    console.log(`📡 Generating ${count} TRULY academic questions for Level ${level}...`);

    const body = {
        contents: [{
            parts: [{
                text: `Generate exactly ${count} unique, high-quality, real academic multiple-choice questions for ${levelDesc} students in India. 
                Topics must be REAL (e.g., "Who was the first Prime Minister of India?", "What is the capital of France?").
                Categories: Mixed (Science, History, GK, Sports, Health).
                Strict JSON Output: [{"text": "...", "options": ["...", "...", "...", "..."], "answerIndex": 0, "category": "General Knowledge", "level": ${level}}]`
            }]
        }],
        generationConfig: { responseMimeType: "application/json", temperature: 1.0 }
    };

    const res = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || "Quota Limit Hit");

    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
}

async function runSeeder() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected for Genuine Seeding");

        // Clear placeholders
        await Question.deleteMany({});
        console.log("🧹 Placeholder data cleared.");

        for (const L of [1, 2, 3]) {
            let success = false;
            let retries = 3;
            while (!success && retries > 0) {
                try {
                    const qs = await generateGenuineBatch(L, 20); // 20 per level to be safe
                    await Question.insertMany(qs);
                    console.log(`✅ Level ${L} updated with ${qs.length} GENUINE questions.`);
                    success = true;
                } catch (e) {
                    console.log(`⚠️ Level ${L} failed (${e.message}). Waiting 30s...`);
                    retries--;
                    await new Promise(r => setTimeout(r, 30000));
                }
            }
        }

        console.log("🏁 Genuine Seeding COMPLETE!");
        process.exit(0);
    } catch (e) {
        console.error("💥 Fatal:", e);
        process.exit(1);
    }
}

runSeeder();
