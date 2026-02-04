import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    process.exit(1);
}

const QuizResultSchema = new mongoose.Schema({}, { strict: false });
const QuizResult = mongoose.models.QuizResult || mongoose.model('QuizResult', QuizResultSchema);

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const count = await QuizResult.countDocuments({});
        console.log(`Current Total Quiz Results in DB: ${count}`);

        if (count > 0) {
            const lastResult = await QuizResult.findOne().sort({ attemptDate: -1 });
            console.log('Last Result Details:', JSON.stringify(lastResult, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
