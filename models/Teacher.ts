
import mongoose, { Schema, model, models } from 'mongoose';

const TeacherSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true }, // Link to parent School Admin
    schoolName: { type: String, required: true }, // Denormalized for convenience
    subject: { type: String },
    phone: { type: String },
    uniqueId: { type: String, required: true, unique: true }, // Teacher ID (e.g., T-101)
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

const Teacher = models.Teacher || model('Teacher', TeacherSchema);

export default Teacher;
