
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Teacher from '@/models/Teacher';
import Faculty from '@/models/Faculty';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const schoolId = searchParams.get('schoolId');

        if (!schoolId) {
            return NextResponse.json({ error: "School ID required" }, { status: 400 });
        }

        // Fetch Teachers belonging to this School
        const teachers = await Teacher.find({ schoolId }).sort({ name: 1 });
        return NextResponse.json({ teachers });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const conn = await dbConnect();
        if (!conn) {
            console.error("❌ Database connection failed during Teacher creation");
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        console.log("✅ Database connected for Teacher creation");
        const body = await req.json();

        // Accept schoolId and schoolName from body (from client's localStorage)
        const { name, email, password, subject, phone, schoolId, schoolName } = body;

        // Validation
        if (!name || !email || !password || !schoolId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check uniqueness (Email only)
        const exists = await Teacher.findOne({ email: email.toLowerCase() });

        if (exists) {
            return NextResponse.json({ error: "Teacher with this Email already exists." }, { status: 409 });
        }

        // Fetch School Admin to get the School's Unique Code (e.g., EQ)
        const schoolAdmin = await Faculty.findById(schoolId);
        const schoolCode = schoolAdmin?.uniqueId || "SCH";

        // Auto-generate Unique ID (e.g., EQ-T1001)
        const count = await Teacher.countDocuments({ schoolId }); // Count per school ideally, or global if preferred
        // Using global count to ensure absolute uniqueness or per school? 
        // Let's use global count to avoid collisions if multiple schools use same pattern, 
        // OR better: {SchoolCode}-T{Count} is unique if SchoolCode is unique.
        const teacherCount = await Teacher.countDocuments() + 1000;
        const autoUniqueId = `${schoolCode}-T${teacherCount + Math.floor(Math.random() * 100)}`;

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Teacher
        const newTeacher = await Teacher.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            uniqueId: autoUniqueId,
            subject,
            phone,
            schoolId,
            schoolName: schoolName || "School"
        });

        console.log(`✅ Teacher Created: ${newTeacher.name} (ID: ${newTeacher.uniqueId})`);

        return NextResponse.json({
            message: "Teacher created successfully",
            teacher: newTeacher
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacherId');
        if (!teacherId) return NextResponse.json({ error: 'teacherId required' }, { status: 400 });
        await Teacher.findByIdAndDelete(teacherId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { teacherId, name, email, subject, phone, newPassword } = body;
        if (!teacherId) return NextResponse.json({ error: 'teacherId required' }, { status: 400 });

        const updateFields: any = { name, email: email?.toLowerCase(), subject, phone };

        // ✅ If a new password is provided, hash it before saving
        if (newPassword && newPassword.trim().length >= 6) {
            updateFields.password = await bcrypt.hash(newPassword.trim(), 10);
        }

        const updated = await Teacher.findByIdAndUpdate(
            teacherId,
            updateFields,
            { new: true }
        );
        return NextResponse.json({ success: true, teacher: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
