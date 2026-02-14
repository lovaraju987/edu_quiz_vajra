import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const isDbConnected = await dbConnect();
        const { email, password, uniqueId } = await req.json();

        // Find by email OR uniqueId
        const faculty = await Faculty.findOne({
            $or: [
                { email: email?.toLowerCase() },
                { uniqueId: uniqueId || email } // fallback email as ID if uniqueId not sent separately
            ]
        });

        if (!faculty) {
            return NextResponse.json({ error: 'Account not found', code: 'EMAIL_NOT_FOUND' }, { status: 404 });
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
                role: faculty.role || 'admin', // Default to admin for legacy users
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
