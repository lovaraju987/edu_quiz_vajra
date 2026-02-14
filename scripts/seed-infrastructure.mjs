import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const FacultySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    schoolName: { type: String, required: true },
    schoolBoard: { type: String, default: "CBSE" },
    uniqueId: { type: String, required: true, unique: true },
    designation: { type: String },
    phone: { type: String },
    address: { type: String },
    isProfileActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

const SchoolSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 100 },
    address: { type: String, required: true, maxlength: 200 },
    email: { type: String, required: true },
    phone: { type: String, required: true, maxlength: 20 },
    principalName: { type: String, required: true, maxlength: 100 },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    idNo: { type: String, required: true, unique: true },
    class: { type: String, required: true },
    school: { type: String, required: true },
    password: { type: String },
    displayPassword: { type: String, default: '' },
    isFirstLogin: { type: Boolean, default: false },
    status: { type: String, default: 'Active' },
    lastActiveAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
const School = mongoose.models.School || mongoose.model('School', SchoolSchema);
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to DB for Infrastructure Seeding");

        // 1. Seed School
        await School.deleteMany({ name: "Vajra International School" });
        const school = await School.create({
            name: "Vajra International School",
            address: "123 Academic Street, Hyderabad",
            email: "info@vajraschool.com",
            phone: "040-12345678",
            principalName: "Dr. K. Rao",
            category: "Private"
        });
        console.log("✅ Seeded School");

        // 2. Seed Faculty
        await Faculty.deleteMany({ email: "admin@vajra.com" });
        const hashedFacultyPassword = await bcrypt.hash("password123", 10);
        await Faculty.create({
            name: "Admin Faculty",
            email: "admin@vajra.com",
            password: hashedFacultyPassword,
            schoolName: "Vajra International School",
            uniqueId: "FAC-001",
            isProfileActive: true
        });
        console.log("✅ Seeded Faculty");

        // 3. Seed Student
        await Student.deleteMany({ idNo: "TEST-001" });
        const hashedStudentPassword = await bcrypt.hash("password123", 10);
        await Student.create({
            name: "Test Student",
            idNo: "TEST-001",
            class: "10th",
            school: "Vajra International School",
            password: hashedStudentPassword,
            displayPassword: "password123",
            isFirstLogin: false
        });
        console.log("✅ Seeded Student (ID: TEST-001, Pass: password123)");

        console.log("🏁 Infrastructure Seeding COMPLETE!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seed();
