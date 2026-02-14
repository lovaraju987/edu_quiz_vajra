
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config({ path: '.env.local' });

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    answerIndex: { type: Number, required: true },
    category: { type: String, default: "General Knowledge" },
    level: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

async function fetchOpenTrivia(amount) {
    try {
        const url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
        console.log(`🌍 Fetching ${amount} questions from OpenTDB...`);
        const res = await fetch(url);
        const data = await res.json();

        if (data.response_code !== 0) {
            console.warn(`OpenTDB returned code ${data.response_code}. Retrying in 2s...`);
            await new Promise(r => setTimeout(r, 2000));
            return fetchOpenTrivia(amount); // Retry once
        }

        return data.results.map(q => {
            // Mix correct answer into incorrect answers
            const options = [...q.incorrect_answers];
            const correctIndex = Math.floor(Math.random() * 4);
            options.splice(correctIndex, 0, q.correct_answer);

            // Decode HTML entities (basic)
            const decode = (str) => str.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&eacute;/g, "é");

            return {
                text: decode(q.question),
                options: options.map(decode),
                answerIndex: correctIndex,
                category: q.category,
                level: q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3
            };
        });
    } catch (e) {
        console.error("Fetch failed:", e.message);
        return [];
    }
}

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const currentCount = await Question.countDocuments();
        console.log(`📊 Current Questions: ${currentCount}`);

        const TARGET = 450;
        let needed = TARGET - currentCount;

        if (needed <= 0) {
            console.log("🎉 Target already reached!");
            process.exit(0);
        }

        console.log(`🎯 Need ${needed} more questions.`);

        // OpenTDB max is 50 per call. We loop.
        while (needed > 0) {
            const batchSize = Math.min(needed, 50);
            const newQs = await fetchOpenTrivia(batchSize);

            if (newQs.length > 0) {
                await Question.insertMany(newQs);
                console.log(`✅ Saved ${newQs.length} questions.`);
                needed -= newQs.length;
                console.log(`📉 Remaining needed: ${needed}`);
            }

            // Respect API rate limits (1 call per 5 seconds recommended)
            if (needed > 0) {
                console.log("💤 Cooling down for 5s...");
                await new Promise(r => setTimeout(r, 5000));
            }
        }

        console.log("\n🚀 All 450 questions seeded successfully!");
        process.exit(0);

    } catch (error) {
        console.error("🔥 Fatal Error:", error);
        process.exit(1);
    }
}

seed();
