
const mongoose = require('mongoose');

// Use connection logic
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://hemanthsilla_db_user:xWeCpptLYS39Qqde@cluster0.0wvrlfh.mongodb.net/edu_quiz_vajra?retryWrites=true&w=majority&appName=Cluster0";

async function checkQuestions() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const QuestionSchema = new mongoose.Schema({
            category: String,
            level: Number,
            text: String,
            question: String // Check for older schema too
        });
        const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

        const counts = await Question.aggregate([
            {
                $group: {
                    _id: { level: "$level", category: "$category" },
                    count: { $sum: 1 },
                    sampleText: { $first: "$text" },
                    sampleQ: { $first: "$question" }
                }
            },
            { $sort: { "_id.level": 1, "_id.category": 1 } }
        ]);

        console.log("Question Counts:", JSON.stringify(counts, null, 2));

        const total = await Question.countDocuments();
        console.log("Total Questions:", total);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkQuestions();
