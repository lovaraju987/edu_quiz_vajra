import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Faculty = mongoose.connection.collection('faculties');
    const all = await Faculty.find({}).toArray();
    fs.writeFileSync('faculties_debug.json', JSON.stringify(all, null, 2));
    console.log(`Wrote ${all.length} faculties to file.`);
    process.exit(0);
}

check();
