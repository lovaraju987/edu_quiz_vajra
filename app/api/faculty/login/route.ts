import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const isDbConnected = await dbConnect();
        const { email, password } = await req.json();

        // MOCK MODE FALLBACK
        if (isDbConnected === false) {
            return NextResponse.json({
                message: 'Login successful (MOCK MODE)',
                user: {
                    id: 'mock-faculty-id',
                    name: 'Mock Faculty',
                    email: email,
                    schoolName: 'Vajra International (MOCK)',
                    uniqueId: 'EQ',
                }
            });
        }

        const faculty = await Faculty.findOne({ email });
        if (!faculty) {
            return NextResponse.json({ error: 'Email not found', code: 'EMAIL_NOT_FOUND' }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(password, faculty.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Password is incorrect', code: 'INVALID_PASSWORD' }, { status: 401 });
        }

        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                schoolName: faculty.schoolName,
                uniqueId: faculty.uniqueId,
                isProfileActive: faculty.isProfileActive,
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
