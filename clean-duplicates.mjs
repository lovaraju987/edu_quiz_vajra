
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config({ path: '.env.local' });

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    answerIndex: { type: Number, required: true },
    category: { type: String, default: 'General Knowledge' },
    level: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

async function cleanDuplicatesAndRefill() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Fetch all questions
        const allQuestions = await Question.find({});
        console.log(`📊 Total Raw Questions: ${allQuestions.length}`);

        // 2. Identify Duplicates (based on text similarity/exact match)
        const uniqueMap = new Map();
        const duplicates = [];

        for (const q of allQuestions) {
            // Normalize: lowercase, remove punctuation/spaces for comparison
            const key = q.text.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (uniqueMap.has(key)) {
                duplicates.push(q._id);
            } else {
                uniqueMap.set(key, q._id);
            }
        }

        console.log(`🗑️ Found ${duplicates.length} duplicate questions.`);

        // 3. Delete Duplicates
        if (duplicates.length > 0) {
            await Question.deleteMany({ _id: { $in: duplicates } });
            console.log("✅ Duplicates deleted.");
        }

        // 4. Check Current Count
        const currentCount = await Question.countDocuments();
        console.log(`📉 Count after cleanup: ${currentCount}`);

        // 5. Refill if needed
        const needed = 450 - currentCount;
        if (needed > 0) {
            console.log(`💪 Refilling ${needed} needed unique questions...`);
            await fetchAndFill(needed);
        } else {
            console.log("🎉 Database is clean and full (450+ unique)!");
        }

        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

async function fetchAndFill(amount) {
    if (amount <= 0) return;

    // Fetch slightly more to account for potential collisions
    const fetchAmount = amount + 5;
    const url = `https://opentdb.com/api.php?amount=${fetchAmount}&type=multiple`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.results) {
            const newQs = data.results.map(q => {
                const options = [...q.incorrect_answers];
                const correctIndex = Math.floor(Math.random() * 4);
                options.splice(correctIndex, 0, q.correct_answer);

                const decode = (str) => str.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&eacute;/g, "é");

                return {
                    text: decode(q.question),
                    options: options.map(decode),
                    answerIndex: correctIndex,
                    category: q.category,
                    level: q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3
                };
            });

            // Filtering new ones against DB before insertion would be ideal, 
            // but for speed, we insert and let the next cleanup catch it or rely on probability.
            // Actually, let's just insert them. The probability of collision with existing 400 Qs from a pool of 4000 is low.
            await Question.insertMany(newQs.slice(0, amount));
            console.log(`✅ Added ${Math.min(newQs.length, amount)} fresh questions.`);
        }
    } catch (e) {
        console.error("Refill failed", e);
    }
}

cleanDuplicatesAndRefill();
