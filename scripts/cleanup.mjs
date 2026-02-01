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

// Minimal models for deletion
const FacultySchema = new mongoose.Schema({}, { strict: false });
const StudentSchema = new mongoose.Schema({}, { strict: false });
const QuizResultSchema = new mongoose.Schema({}, { strict: false });

const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
const QuizResult = mongoose.models.QuizResult || mongoose.model('QuizResult', QuizResultSchema);

async function cleanup() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('Wiping Faculty data...');
        await Faculty.deleteMany({});

        console.log('Wiping Student data...');
        await Student.deleteMany({});

        console.log('Wiping Quiz Results data...');
        await QuizResult.deleteMany({});

        console.log('✅ Database Cleaned! You can now start fresh registration.');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanup();
