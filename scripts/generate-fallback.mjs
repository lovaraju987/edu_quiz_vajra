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

async function generateBatch(level, category, count = 15) {
    const levelDesc = level === 1 ? "Class 4-6" : level === 2 ? "Class 7-8" : "Class 9-10";
    // Using gemini-flash-latest as verified in model list
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

    console.log(`📡 Generating ${count} questions for Level ${level}, Category ${category}...`);

    const body = {
        contents: [{
            parts: [{
                text: `Generate exactly ${count} unique multiple-choice questions for school students.
                - Level: ${level} (${levelDesc})
                - Category: ${category}
                - Output strictly in valid JSON format as an array of objects.
                - Format: [{"text": "...", "options": ["...", "...", "...", "..."], "answerIndex": 0-3, "category": "${category}", "level": ${level}}]`
            }]
        }],
        generationConfig: { responseMimeType: "application/json" }
    };

    const res = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
    const data = await res.json();

    if (!res.ok) {
        if (res.status === 429) throw new Error("RATE_LIMIT");
        throw new Error(data.error?.message || "Unknown API Error");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return JSON.parse(text);
}

async function runSeeder() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected for Full Fallback Seeding");

        await Question.deleteMany({});
        console.log("🧹 MongoDB Cleared.");

        const levels = [1, 2, 3];
        const categories = ['GK', 'Science', 'History', 'Health', 'Sports'];
        let totalSeeded = 0;

        for (const level of levels) {
            for (const category of categories) {
                for (let batchNum = 1; batchNum <= 2; batchNum++) {
                    let success = false;
                    let retries = 5;
                    while (!success && retries > 0) {
                        try {
                            const qs = await generateBatch(level, category, 15);
                            await Question.insertMany(qs.map(q => ({ ...q, level, category })));
                            totalSeeded += qs.length;
                            console.log(`✅ [L${level}] [${category}] Batch ${batchNum} seeded (${qs.length} questions). Total: ${totalSeeded}`);
                            success = true;
                            await new Promise(r => setTimeout(r, 15000)); // 15s delay between requests
                        } catch (e) {
                            if (e.message === "RATE_LIMIT") {
                                console.log(`⚠️ Rate limit hit. Waiting 60s...`);
                                await new Promise(r => setTimeout(r, 60000));
                            } else {
                                console.log(`⚠️ Attempt failed: ${e.message}. Retrying...`);
                                await new Promise(r => setTimeout(r, 10000));
                            }
                            retries--;
                        }
                    }
                }
            }
        }

        console.log(`\n🏁 ALL DONE! Total Questions Seeded: ${totalSeeded}`);
        process.exit(0);
    } catch (e) {
        console.error("💥 Fatal:", e);
        process.exit(1);
    }
}

runSeeder();
