import mongoose, { Schema, model, models } from 'mongoose';

const StudentSchema = new Schema({
    name: { type: String, required: true },
    idNo: { type: String, required: true, unique: true },
    class: { type: String, required: true },
    section: { type: String, trim: true, default: '' }, // New Section Field
    rollNo: { type: String, trim: true }, // Optional School Roll Number
    age: { type: String },
    school: { type: String, required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', index: true },
    password: { type: String }, // Hashed password
    displayPassword: { type: String, default: '' }, // Plain text for faculty view
    isFirstLogin: { type: Boolean, default: true },
    status: { type: String, default: 'Active' },
    lastActiveAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now, index: true },
});

// Ensure rollNo is unique per section/class per school
StudentSchema.index({ school: 1, class: 1, section: 1, rollNo: 1 }, { unique: true, sparse: true });

// In Next.js development, models can get cached with old schemas. 
// This check helps ensure the 'displayPassword' field is recognized.
if (models && models.Student && (!models.Student.schema.paths.displayPassword || !models.Student.schema.paths.isFirstLogin)) {
    delete (models as any).Student;
}

const Student = models && models.Student ? models.Student : model('Student', StudentSchema);

export default Student as any;
