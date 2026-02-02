import mongoose, { Schema, model, models } from 'mongoose';

const QuestionSchema = new Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    answerIndex: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Health', 'Science', 'Sports', 'GK', 'History'],
        index: true
    },
    level: { type: Number, required: true, enum: [1, 2, 3], index: true }, // 1: 4-6, 2: 7-8, 3: 9-10
    createdAt: { type: Date, default: Date.now, index: true }, // Index for sorting, removed auto-delete for history
});

const Question = models.Question || model('Question', QuestionSchema);

export default Question;
