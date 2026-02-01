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
        const { name, idNo, class: studentClass, school, facultyId, password, age } = body;

        // MOCK MODE FALLBACK
        if (isDbConnected === false) {
            return NextResponse.json({
                message: 'Student enrolled successfully (MOCK MODE)',
                student: { ...body, idNo: idNo.toUpperCase(), displayPassword: password, createdAt: new Date() }
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
            displayPassword: password, // Store plain text for faculty
            age,
        });

        // Update using raw collection to bypass any Mongoose schema caching issues in development
        await Student.collection.updateOne(
            { _id: student._id },
            { $set: { displayPassword: password } }
        );

        // Fetch the fresh student record
        const savedStudent = await Student.findById(student._id).lean();

        return NextResponse.json({ message: 'Student enrolled successfully', student: savedStudent }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, name, idNo, class: studentClass, age, password } = body;

        if (!id) return NextResponse.json({ error: 'Student ID required' }, { status: 400 });

        const updateData: any = { name, idNo, class: studentClass, age };
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
            updateData.displayPassword = password; // Explicitly update plain text
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).lean();

        if (!updatedStudent) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

        // Force update displayPassword using raw collection to bypass any Mongoose cache issues
        if (password && password.trim() !== '') {
            await Student.collection.updateOne(
                { _id: updatedStudent._id },
                { $set: { displayPassword: password } }
            );
        }

        // Fetch fresh object for the frontend
        const freshStudent = await Student.findById(id).lean();

        return NextResponse.json({
            message: 'Student updated successfully',
            student: freshStudent
        }, { status: 200 });
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
