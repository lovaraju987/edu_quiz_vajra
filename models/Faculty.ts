import mongoose, { Schema, model, models } from 'mongoose';

const FacultySchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    schoolName: { type: String, required: true },
    uniqueId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
});

const Faculty = models.Faculty || model('Faculty', FacultySchema);

export default Faculty;
