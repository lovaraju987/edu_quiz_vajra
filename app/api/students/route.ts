import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const facultyId = searchParams.get('facultyId');

        const query = facultyId ? { facultyId } : {};
        const students = await Student.find(query).sort({ createdAt: -1 });

        return NextResponse.json(students);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, idNo, class: studentClass, school, facultyId } = await req.json();

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
            facultyId,
        });

        return NextResponse.json({ message: 'Student enrolled successfully', student }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
