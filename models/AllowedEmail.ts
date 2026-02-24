
import mongoose, { Schema, model, models } from 'mongoose';

const AllowedEmailSchema = new Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    schoolName: { type: String, trim: true },
    address: { type: String, trim: true },
    addedAt: { type: Date, default: Date.now },
    // ✅ Registration OTP — stored in DB (survives hot-reload, server restarts)
    regOtp: { type: String, default: null },
    regOtpExpiry: { type: Date, default: null },
});

// Prevent stale model compilation in development
if (process.env.NODE_ENV === 'development') {
    if (models.AllowedEmail) {
        delete models.AllowedEmail;
    }
}

const AllowedEmail = models.AllowedEmail || model('AllowedEmail', AllowedEmailSchema);

export default AllowedEmail;
