
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config({ path: '.env.local' });

// Define Question Schema
const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    answerIndex: { type: Number, required: true },
    category: { type: String, default: "General Knowledge" },
    level: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

async function generateBatch(offset, limit, level) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `Generate exactly ${limit} distinct multiple-choice questions suitable for Level ${level} students (Grade ${level === 1 ? '4-5' : level === 2 ? '6-8' : '9-10'}).
    Mix categories: Science, Math, History, Geography, Literature, General Knowledge.
    Ensuring NO duplicates with common questions like capital of India or simple addition.
    Output purely a JSON array of objects with this structure:
    [
      {
        "text": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answerIndex": 0, // 0-3 index of correct answer
        "category": "Science",
        "level": ${level}
      }
    ]`;

    const body = {
        contents: [{
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            response_mime_type: "application/json"
        }
    };

    console.log(`🤖 Requesting ${limit} questions for Level ${level}...`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${data.error?.message || response.statusText}`);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("No content text in response");

        // Clean JSON if needed (sometimes markdown blocks are included if mime_type fails)
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const questions = JSON.parse(jsonStr);

        return questions;

    } catch (error) {
        console.error("❌ Generation failed:", error.message);
        return [];
    }
}

async function seedMissing() {
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

        // Strategy: Run batches of 25 to respect token limits
        // Alternate levels: 1, 2, 3
        let batchSize = 25;
        let round = 0;

        while (needed > 0) {
            // Determine level for this batch to keep distribution decent
            // If currentCount is 255, we likely have L1/L2 filled, need more L3 or mix
            // Let's cycle 1, 2, 3 based on round
            const level = (round % 3) + 1;

            // Adjust batch size if needed is small
            const currentBatchSize = Math.min(batchSize, needed);

            console.log(`\n⏳ Batch ${round + 1}: Generating ${currentBatchSize} Qs for Level ${level}...`);

            const newQs = await generateBatch(0, currentBatchSize, level);

            if (newQs.length > 0) {
                await Question.insertMany(newQs);
                console.log(`✅ Saved ${newQs.length} questions.`);
                needed -= newQs.length;
                console.log(`📉 Remaining needed: ${needed}`);
            } else {
                console.log("⚠️ Batch failed or empty. Retrying in 10s...");
            }

            round++;

            if (needed > 0) {
                console.log("💤 Cooling down for 5s to avoid rate limits...");
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

seedMissing();
