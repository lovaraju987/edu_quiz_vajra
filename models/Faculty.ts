import mongoose, { Schema, model, models } from 'mongoose';

const FacultySchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    schoolName: { type: String, required: true },
    schoolBoard: { type: String, default: "CBSE" },
    uniqueId: { type: String, required: true, unique: true },
    designation: { type: String },
    phone: { type: String },
    address: { type: String },
    isProfileActive: { type: Boolean, default: false },
    role: { type: String, enum: ['admin', 'teacher'], default: 'admin' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Faculty' },
    createdAt: { type: Date, default: Date.now },
    // ✅ Password Reset OTP fields
    resetOtp: { type: String, default: null },          // 6-digit OTP (hashed)
    resetOtpExpiry: { type: Date, default: null },       // 10-minute expiry
    resetOtpAttempts: { type: Number, default: 0 },      // brute force protection
});

const Faculty = models.Faculty || model('Faculty', FacultySchema);

export default Faculty as any;
