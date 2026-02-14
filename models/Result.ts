import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    level: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    answers: [{
        questionId: String,
        selectedOption: String,
        isCorrect: Boolean,
    }],
    completedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Result || mongoose.model('Result', ResultSchema);
