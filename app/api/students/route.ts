import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import QuizResult from '@/models/QuizResult';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
    try {
        const isDbConnected = await dbConnect();

        // MOCK MODE FALLBACK
        if (isDbConnected === false) {
            return NextResponse.json([]); // Return empty list in mock mode for now
        }

        const { searchParams } = new URL(req.url);
        const facultyId = searchParams.get('facultyId');

        const query = facultyId ? { facultyId } : {};
        const students = await Student.find(query).select('-password').sort({ createdAt: -1 });

        // Check if each student has attempted a quiz
        const studentsWithStatus = await Promise.all(students.map(async (student) => {
            const result = await QuizResult.findOne({ idNo: student.idNo });
            return {
                ...student.toObject(),
                hasAttempted: !!result
            };
        }));

        return NextResponse.json(studentsWithStatus);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const isDbConnected = await dbConnect();
        const body = await req.json();
        const { name, idNo, class: studentClass, school, facultyId, password } = body;

        // MOCK MODE FALLBACK
        if (isDbConnected === false) {
            return NextResponse.json({
                message: 'Student enrolled successfully (MOCK MODE)',
                student: { ...body, idNo: idNo.toUpperCase(), createdAt: new Date() }
            }, { status: 201 });
        }

        // Check if student ID already exists
        const existingStudent = await Student.findOne({ idNo: idNo.toUpperCase() });
        if (existingStudent) {
            return NextResponse.json({ error: 'Student ID already exists' }, { status: 400 });
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        const student = await Student.create({
            name,
            idNo: idNo.toUpperCase(),
            class: studentClass,
            school,
            facultyId,
            password: hashedPassword,
        });

        return NextResponse.json({ message: 'Student enrolled successfully', student }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, name, idNo, class: studentClass, age } = body;

        if (!id) return NextResponse.json({ error: 'Student ID required' }, { status: 400 });

        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { name, idNo, class: studentClass, age },
            { new: true }
        );

        return NextResponse.json({ message: 'Student updated successfully', student: updatedStudent });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Student ID required' }, { status: 400 });

        await Student.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Student deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
