import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';
import AllowedEmail from '@/models/AllowedEmail';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const isDbConnected = await dbConnect();
        const body = await req.json();
        const { name, email, password, schoolName, uniqueId } = body;

        // MOCK MODE FALLBACK
        if (isDbConnected === false) {
            return NextResponse.json({
                message: 'Faculty registered successfully (MOCK MODE)',
                faculty: { id: 'mock-reg-id', name }
            }, { status: 201 });
        }

        // 1. SECURITY: Check if Email is Allowed (Whitelisted)
        // Only run this check if db is connected (which it is here)
        const isAllowed = await AllowedEmail.findOne({ email: email.toLowerCase() });

        // If email is NOT in the allowed list, BLOCK registration
        if (!isAllowed) {
            return NextResponse.json({
                error: 'Authorization Failed: This email is not approved for school registration. Please contact the administrator.'
            }, { status: 403 });
        }

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

        return NextResponse.json({ message: 'Faculty registered successfully', faculty: { id: faculty._id, name: faculty.name } }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
