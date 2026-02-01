import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const idNo = searchParams.get('idNo');

        // PUBLIC ACCESS: If a specific student ID is provided (for student login)
        if (idNo) {
            const student = await Student.findOne({ idNo: idNo.toUpperCase() });
            if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
            return NextResponse.json([student]); // Return as array for compatibility
        }

        // PROTECTED ACCESS: Faculty viewing all students
        const { getFacultyIdFromRequest } = await import('@/lib/auth');
        const authenticatedFacultyId = getFacultyIdFromRequest(req);

        if (!authenticatedFacultyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const students = await Student.find({ facultyId: authenticatedFacultyId }).sort({ createdAt: -1 });

        return NextResponse.json(students);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { getFacultyIdFromRequest } = await import('@/lib/auth');
        const authenticatedFacultyId = getFacultyIdFromRequest(req);

        if (!authenticatedFacultyId) {
            return NextResponse.json({ error: 'Unauthorized: Valid faculty token required' }, { status: 401 });
        }

        const { name, idNo, class: studentClass, school } = await req.json();

        // Check if student ID already exists
        const existingStudent = await Student.findOne({ idNo: idNo.toUpperCase() });
        if (existingStudent) {
            return NextResponse.json({ error: 'Student ID already exists' }, { status: 400 });
        }

        const student = await Student.create({
            name,
            idNo: idNo.toUpperCase(),
            class: studentClass,
            school,
            facultyId: authenticatedFacultyId,
        });

        return NextResponse.json({ message: 'Student enrolled successfully', student }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
