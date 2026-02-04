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

async function generateLevel3() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    console.log(`📡 Fetching Real Questions for Level 3 (Class 9-10)...`);

    const body = {
        contents: [{
            parts: [{
                text: `Generate exactly 25 unique academic multiple-choice questions for Class 9-10 students. 
                Categories: 5 Health, 5 Science, 5 Sports, 5 GK, 5 History.
                Strict JSON Output: [{"text": "...", "options": ["A", "B", "C", "D"], "answerIndex": 0, "category": "Science", "level": 3}]`
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

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Waiting 60s for quota reset...");
        await new Promise(r => setTimeout(r, 60000));

        const qs = await generateLevel3();
        await Question.insertMany(qs);
        console.log("✅ Level 3 Finished!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
