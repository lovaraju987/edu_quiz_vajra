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
    createdAt: { type: Date, default: Date.now },
});

const Faculty = models.Faculty || model('Faculty', FacultySchema);

export default Faculty as any;
