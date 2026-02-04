const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const QuestionSchema = new mongoose.Schema({
    category: String,
    level: Number
});
const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        const total = await Question.countDocuments();
        console.log(`Total Questions: ${total}`);

        const levels = [1, 2, 3];
        const categories = ['Health', 'Science', 'Sports', 'GK', 'History'];

        for (const level of levels) {
            console.log(`\n--- LEVEL ${level} ---`);
            for (const cat of categories) {
                const count = await Question.countDocuments({ level, category: cat });
                console.log(`${cat}: ${count}`);
                if (count < 25) console.warn(`⚠️ WARNING: Low count for Level ${level} ${cat}`);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
