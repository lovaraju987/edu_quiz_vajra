
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import School from '../models/School';

dotenv.config({ path: '.env.local' });

async function checkCategories() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in .env.local');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const categories = await School.distinct('category');
        console.log('Distinct Categories found in DB:', categories);

        const allSchools = await School.find({}, 'name category');
        console.log('All Schools:', allSchools);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkCategories();
