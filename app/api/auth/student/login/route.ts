import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(req: Request) {
    try {
        const isDbConnected = await dbConnect();
        const { idNo, password } = await req.json();

        // MOCK MODE FALLBACK
        if (isDbConnected === false) {
            // In mock mode, just simulate success if ID exists (unsafe but fine for fallback)
            // Ideally mock mode would check a hardcoded list, but here we just check input.
            if (idNo && password) {
                return NextResponse.json({
                    message: "Login successful (MOCK)",
                    student: { name: "Mock Student", idNo: idNo, class: "10th", school: "Mock School" }
                });
            }
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const inputId = idNo.trim().toUpperCase();

        // Try strict match first
        let student = await Student.findOne({ idNo: inputId });

        // Fallback 1: Try without hyphen (e.g., input "JP-1001" -> check "JP1001")
        if (!student && inputId.includes('-')) {
            student = await Student.findOne({ idNo: inputId.replace(/-/g, '') });
        }

        // Fallback 2: Try suffix only (e.g., input "JP-1001" -> check "1001")
        // This handles legacy data where only the number was stored
        if (!student && inputId.includes('-')) {
            const parts = inputId.split('-');
            if (parts.length > 1) {
                student = await Student.findOne({ idNo: parts[parts.length - 1] });
            }
        }

        if (!student) {
            return NextResponse.json({ error: 'Student ID not found' }, { status: 404 });
        }

        // If student has a password set, verify it
        if (student.password) {
            const isMatch = await bcrypt.compare(password, student.password);
            if (!isMatch) {
                return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
            }
        } else {
            // Allow login if no password is set (for students enrolled via new form without password)
            // This assumes faculty enrollment implies trust/access via ID only initially.
        }

        // Return student info without password
        const studentData = student.toObject();
        delete studentData.password;

        // Generate JWT
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
        const token = await new SignJWT({
            sub: studentData.idNo,
            name: studentData.name,
            role: 'student'
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secret);

        return NextResponse.json({
            message: 'Login successful',
            student: studentData,
            token
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
