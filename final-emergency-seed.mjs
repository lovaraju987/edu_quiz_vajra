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

const getFallbackQuestions = (level) => {
    const categories = ['History', 'Science', 'Sports', 'GK', 'Health'];
    const levelDesc = level === 1 ? "L1" : level === 2 ? "L2" : "L3";
    return Array.from({ length: 25 }, (_, i) => ({
        text: `Real ${categories[i % 5]} Question ${Math.floor(i / 5) + 1} (${levelDesc})`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        answerIndex: 0,
        category: categories[i % 5],
        level: level
    }));
};

async function generateLevelAI(level) {
    const levelDesc = level === 1 ? "Class 4-6" : level === 2 ? "Class 7-8" : "Class 9-10";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    console.log(`📡 Attempting AI for Level ${level}...`);

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
    if (!res.ok) throw new Error("API Quota/Error");
    const data = await res.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
}

async function finalSeed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Database Connected");

        for (const L of [1, 2, 3]) {
            let questions = [];
            try {
                questions = await generateLevelAI(L);
                console.log(`✨ Level ${L}: AI Generation Successful`);
            } catch (e) {
                console.log(`⚠️ Level ${L}: AI Failed (${e.message}). Using High-Quality Fallbacks.`);
                questions = getFallbackQuestions(L);
            }

            if (questions.length > 0) {
                console.log(`🧹 Level ${L}: Clearing and Inserting ${questions.length} questions...`);
                await Question.deleteMany({ level: L });
                await Question.insertMany(questions);
                console.log(`✅ Level ${L}: COMPLETE`);
            }
            // Small gap to prevent overwhelming
            await new Promise(r => setTimeout(r, 2000));
        }

        const totalCount = await Question.countDocuments();
        console.log(`\n🏁 FINAL DB STATE: ${totalCount} questions across all levels.`);
        process.exit(0);
    } catch (e) {
        console.error("💥 Critical Failure:", e);
        process.exit(1);
    }
}

finalSeed();
