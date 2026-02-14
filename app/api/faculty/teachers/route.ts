
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { name, email, password, adminId, schoolName } = body;

        // Verify Admin
        const admin = await Faculty.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Only Admins can add teachers' }, { status: 403 });
        }

        // Check Duplicate
        const existing = await Faculty.findOne({ email });
        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Sequential Unique ID related to school
        const prefix = admin.uniqueId; // Usually the school code like 'VK'
        const teacherCount = await Faculty.countDocuments({ createdBy: adminId });
        const uniqueId = `${prefix}-T-${String(teacherCount + 1).padStart(3, '0')}`;

        const newTeacher = await Faculty.create({
            name,
            email,
            password: hashedPassword,
            schoolName: admin.schoolName, // Inherit school
            role: 'teacher',
            createdBy: adminId,
            uniqueId,
            isProfileActive: true // Teachers are auto-activated by Admin
        });

        return NextResponse.json({
            message: 'Teacher created successfully',
            teacher: {
                _id: newTeacher._id,
                name: newTeacher.name,
                email: newTeacher.email,
                uniqueId: newTeacher.uniqueId,
                password
            }
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const adminId = searchParams.get('adminId');

        if (!adminId) return NextResponse.json({ error: 'Admin ID required' }, { status: 400 });

        const teachers = await Faculty.find({ createdBy: adminId }).select('-password').sort({ createdAt: -1 }).lean();
        return NextResponse.json(teachers);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, name, email, password } = body;

        if (!id) return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 });

        const teacher = await Faculty.findById(id);
        if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

        // Check for duplicate email if changing email
        if (email && email !== teacher.email) {
            const existing = await Faculty.findOne({ email });
            if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
            teacher.email = email;
        }

        if (name) teacher.name = name;

        if (password) {
            teacher.password = await bcrypt.hash(password, 10);
        }

        await teacher.save();

        return NextResponse.json({
            message: 'Teacher updated successfully',
            teacher: {
                _id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                uniqueId: teacher.uniqueId
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 });

        await Faculty.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Teacher deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
