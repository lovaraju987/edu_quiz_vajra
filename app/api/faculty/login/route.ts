import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        const faculty = await Faculty.findOne({ email });
        if (!faculty) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, faculty.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const { signToken } = await import('@/lib/auth');
        const token = signToken({ id: faculty._id, email: faculty.email });

        return NextResponse.json({
            message: 'Login successful',
            token,
            user: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                schoolName: faculty.schoolName,
                uniqueId: faculty.uniqueId,
                isProfileActive: faculty.isProfileActive
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
