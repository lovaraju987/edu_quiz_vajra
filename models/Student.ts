import mongoose, { Schema, model, models } from 'mongoose';

const StudentSchema = new Schema({
    name: { type: String, required: true },
    idNo: { type: String, required: true, unique: true },
    class: { type: String, required: true },
    age: { type: String },
    school: { type: String, required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', index: true },
    password: { type: String }, // Hashed password
    displayPassword: { type: String, default: '' }, // Plain text for faculty view
    status: { type: String, default: 'Active' },
    createdAt: { type: Date, default: Date.now },
});

// In Next.js development, models can get cached with old schemas. 
// This check helps ensure the 'displayPassword' field is recognized.
if (models && models.Student && !models.Student.schema.paths.displayPassword) {
    delete (models as any).Student;
}

const Student = models && models.Student ? models.Student : model('Student', StudentSchema);

export default Student;
