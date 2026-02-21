
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Teacher from '@/models/Teacher';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password, uniqueId } = await req.json();

        // Teachers usually log in with uniqueId (Teacher ID) or Email
        const teacher = await Teacher.findOne({
            $or: [
                { uniqueId: uniqueId || email }, // Prefer uniqueId if provided directly
                { email: email?.toLowerCase() }
            ]
        });

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher account not found. Please contact your School Admin.', code: 'TEACHER_NOT_FOUND' }, { status: 404 });
        }

        if (!teacher.isActive) {
            return NextResponse.json({ error: 'Account deactivated. Contact Admin.', code: 'ACCOUNT_INACTIVE' }, { status: 403 });
        }

        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect password.', code: 'INVALID_PASSWORD' }, { status: 401 });
        }

        return NextResponse.json({
            message: 'Teacher Login Successful',
            user: {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                schoolId: teacher.schoolId,
                schoolName: teacher.schoolName,
                uniqueId: teacher.uniqueId,
                role: 'teacher',
                isProfileActive: true // Teachers are pre-verified by Admin
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
