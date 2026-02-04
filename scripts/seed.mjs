import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { questionBank } from './questions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    process.exit(1);
}

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    answerIndex: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Health', 'Science', 'Sports', 'GK', 'History']
    },
    level: { type: Number, required: true, enum: [1, 2, 3] },
    createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await Question.deleteMany({});
        console.log('Cleared existing questions');

        await Question.insertMany(questionBank);
        console.log(`Successfully seeded ${questionBank.length} authentic questions! 🎓`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
