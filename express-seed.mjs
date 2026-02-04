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

async function generateLevel(level) {
    const levelDesc = level === 1 ? "Class 4-6" : level === 2 ? "Class 7-8" : "Class 9-10";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    console.log(`📡 Fetching Real Questions for Level ${level} (${levelDesc})...`);

    const body = {
        contents: [{
            parts: [{
                text: `Generate exactly 25 unique academic multiple-choice questions for ${levelDesc} students. 
                Categories: 5 Health, 5 Science, 5 Sports, 5 GK, 5 History.
                Strict JSON Output: [{"text": "...", "options": ["A", "B", "C", "D"], "answerIndex": 0, "category": "Science", "level": ${level}}]`
            }]
        }],
        generationConfig: { responseMimeType: "application/json" }
    };

    const res = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
    const data = await res.json();

    if (!res.ok) throw new Error(JSON.stringify(data));

    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
}

async function expressSeed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ DB Connected");

        await Question.deleteMany({});
        console.log("🧹 DB Cleared");

        for (const L of [1, 2, 3]) {
            try {
                const qs = await generateLevel(L);
                await Question.insertMany(qs);
                console.log(`✅ Level ${L}: Added ${qs.length} Real Questions`);
                // Short wait to avoid quota hit
                await new Promise(r => setTimeout(r, 10000));
            } catch (e) {
                console.error(`❌ Level ${L} Failed:`, e.message);
            }
        }
        console.log("🏁 Express Seeding Finished!");
        process.exit(0);
    } catch (e) {
        console.error("💥 Fatal:", e);
        process.exit(1);
    }
}

expressSeed();
