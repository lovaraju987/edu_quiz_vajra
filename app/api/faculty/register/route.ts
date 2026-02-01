import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, email, password, schoolName, uniqueId } = await req.json();

        // Check if faculty already exists
        const existingFaculty = await Faculty.findOne({ $or: [{ email }, { uniqueId }] });
        if (existingFaculty) {
            return NextResponse.json({ error: 'Faculty with this email or Unique ID already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const faculty = await Faculty.create({
            name,
            email,
            password: hashedPassword,
            schoolName,
            uniqueId,
        });

        const { signToken } = await import('@/lib/auth');
        const token = signToken({ id: faculty._id, email: faculty.email });

        return NextResponse.json({
            message: 'Faculty registered successfully',
            token,
            user: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                schoolName: faculty.schoolName,
                uniqueId: faculty.uniqueId,
                isProfileActive: faculty.isProfileActive
            }
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
