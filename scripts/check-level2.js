const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function checkLevel2() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Question = mongoose.models.Question || mongoose.model('Question', new mongoose.Schema({ category: String, level: Number }));
        const counts = await Question.aggregate([
            { $match: { level: 2 } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        console.log("Level 2 Distribution:", counts);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkLevel2();
