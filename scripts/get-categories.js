const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function checkCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Question = mongoose.models.Question || mongoose.model('Question', new mongoose.Schema({ category: String }));
        const categories = await Question.distinct('category');
        console.log("Unique Categories:", categories);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkCategories();
