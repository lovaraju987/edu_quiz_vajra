
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SchoolSchema = new mongoose.Schema({}, { strict: false });
const School = mongoose.models.School || mongoose.model('School', SchoolSchema);

async function clear() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('No MONGODB_URI found');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        console.log('Clearing schools collection...');
        await School.deleteMany({});

        console.log('Schools collection cleared.');

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

clear();
