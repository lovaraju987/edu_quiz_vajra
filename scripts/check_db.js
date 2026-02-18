
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Define minimal schema
const SchoolSchema = new mongoose.Schema({
    name: String,
    category: String
}, { strict: false });

const School = mongoose.models.School || mongoose.model('School', SchoolSchema);

async function check() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('No MONGODB_URI found');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const count = await School.countDocuments();
        console.log('Total Schools:', count);

        const categories = await School.distinct('category');
        console.log('Distinct Categories:', categories);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
