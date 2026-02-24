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
    categoryScores: { type: Map, of: Number }, // { "History": 4, "Science": 5 }

    // NEW FIELDS for Ranking System
    timeTaken: { type: Number }, // seconds taken to complete quiz
    rank: { type: Number, index: true }, // calculated rank (1, 2, 3...)
    rankCalculatedAt: { type: Date }, // when ranking was calculated
    submittedAt: { type: Date, default: Date.now }, // exact submission timestamp
    resultsReleasedAt: { type: Date }, // 8:30 PM of quiz date
});

// Compound index for efficient ranking queries
QuizResultSchema.index({ attemptDate: 1, score: -1, timeTaken: 1 });
// ✅ Student dashboard: fetch all results for one student sorted by date
QuizResultSchema.index({ idNo: 1, attemptDate: -1 });
// ✅ Leaderboard: find rank of a specific student
QuizResultSchema.index({ idNo: 1, rank: 1 });
// ✅ School-level leaderboard queries
QuizResultSchema.index({ schoolName: 1, score: -1, attemptDate: -1 });

const QuizResult = models.QuizResult || model('QuizResult', QuizResultSchema);

export default QuizResult as any;
