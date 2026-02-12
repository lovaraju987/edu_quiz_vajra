
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const QuestionSchema = new mongoose.Schema({
    text: String,
    level: String,
    category: String,
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

async function checkQuestions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const levels = await Question.distinct('level');
        console.log('Available Levels in DB:', levels);

        for (const level of levels) {
            const count = await Question.countDocuments({ level });
            console.log(`Level ${level}: ${count} questions`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkQuestions();
