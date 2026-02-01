import mongoose, { Schema, model, models } from 'mongoose';

const StudentSchema = new Schema({
    name: { type: String, required: true },
    idNo: { type: String, required: true, unique: true },
    class: { type: String, required: true },
    school: { type: String, required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', index: true },
    status: { type: String, default: 'Active' },
    createdAt: { type: Date, default: Date.now },
});

const Student = models.Student || model('Student', StudentSchema);

export default Student;
