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

async function wipe() {
    try {
        console.log('Connecting to Database...');
        await mongoose.connect(MONGODB_URI);

        const collections = ['faculties', 'students', 'quizresults', 'questions'];

        for (const colName of collections) {
            console.log(`Wiping collection: ${colName}...`);
            await mongoose.connection.collection(colName).deleteMany({});
        }

        console.log('--- DATABASE WIPE COMPLETE ---');
        console.log('Platform is now in "Pristine Status" 💎');

        process.exit(0);
    } catch (err) {
        console.error('Wipe failed:', err);
        process.exit(1);
    }
}

wipe();
