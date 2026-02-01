import mongoose, { Schema, model, models } from 'mongoose';

const QuizResultSchema = new Schema({
    studentId: { type: String, required: true },
    idNo: { type: String, required: true, index: true },
    studentName: { type: String },
    schoolName: { type: String },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    level: { type: String, required: true },
    attemptDate: { type: Date, default: Date.now, index: true },
});

const QuizResult = models.QuizResult || model('QuizResult', QuizResultSchema);

export default QuizResult;
