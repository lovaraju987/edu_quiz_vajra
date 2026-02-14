import mongoose, { Schema, model, models } from 'mongoose';

const QuizResultSchema = new Schema({
    studentId: { type: String, required: true },
    idNo: { type: String, required: true, index: true },
    studentName: { type: String },
    schoolName: { type: String },
    score: { type: Number, required: true, index: true },
    totalQuestions: { type: Number, required: true },
    level: { type: String, required: true },
    attemptDate: { type: Date, default: Date.now, index: true },

    // NEW FIELDS for Ranking System
    timeTaken: { type: Number }, // seconds taken to complete quiz
    rank: { type: Number, index: true }, // calculated rank (1, 2, 3...)
    rankCalculatedAt: { type: Date }, // when ranking was calculated
    submittedAt: { type: Date, default: Date.now }, // exact submission timestamp
    resultsReleasedAt: { type: Date }, // 8:30 PM of quiz date
});

// Compound index for efficient ranking queries
QuizResultSchema.index({ attemptDate: 1, score: -1, timeTaken: 1 });

const QuizResult = models.QuizResult || model('QuizResult', QuizResultSchema);

export default QuizResult as any;
