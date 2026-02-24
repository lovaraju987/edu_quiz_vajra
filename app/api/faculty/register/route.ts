import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';
import AllowedEmail from '@/models/AllowedEmail';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const isDbConnected = await dbConnect();
        const body = await req.json();
        const { name, email, password, schoolName, uniqueId, otp } = body;

        // MOCK MODE FALLBACK
        if (isDbConnected === false) {
            return NextResponse.json({
                message: 'Faculty registered successfully (MOCK MODE)',
                faculty: { id: 'mock-reg-id', name }
            }, { status: 201 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // ✅ OTP is required
        if (!otp) {
            return NextResponse.json(
                { error: 'Email verification OTP is required.' },
                { status: 400 }
            );
        }

        // ✅ Lookup OTP from AllowedEmail in DB (not memory — survives hot reload)
        const allowed = await AllowedEmail.findOne({ email: normalizedEmail });

        if (!allowed) {
            return NextResponse.json(
                { error: 'This email is not approved for school registration.' },
                { status: 403 }
            );
        }

        if (!allowed.regOtp || !allowed.regOtpExpiry) {
            return NextResponse.json(
                { error: 'No OTP found. Please click "Send Verification OTP" first.' },
                { status: 400 }
            );
        }

        // ✅ Check expiry
        if (new Date() > new Date(allowed.regOtpExpiry)) {
            // Clear expired OTP
            await AllowedEmail.findByIdAndUpdate(allowed._id, { regOtp: null, regOtpExpiry: null });
            return NextResponse.json(
                { error: 'OTP has expired. Please request a new verification code.' },
                { status: 400 }
            );
        }

        // ✅ Verify OTP
        const isOtpValid = await bcrypt.compare(otp.toString().trim(), allowed.regOtp);
        if (!isOtpValid) {
            return NextResponse.json(
                { error: 'Incorrect OTP. Please check your email and try again.' },
                { status: 400 }
            );
        }

        // ✅ Check duplicate account
        const existingFaculty = await Faculty.findOne({ $or: [{ email: normalizedEmail }, { uniqueId }] });
        if (existingFaculty) {
            return NextResponse.json(
                { error: 'An account with this email already exists. Please login.' },
                { status: 409 }
            );
        }

        // ✅ Hash password and create account
        const hashedPassword = await bcrypt.hash(password, 12);
        const faculty = await Faculty.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            schoolName: schoolName || 'Vajra International',
            uniqueId: uniqueId || `EQ${Date.now()}`,
        });

        // ✅ Clear OTP from DB after successful registration
        await AllowedEmail.findByIdAndUpdate(allowed._id, { regOtp: null, regOtpExpiry: null });

        return NextResponse.json(
            { message: 'School registered successfully! Please login to continue.', faculty: { id: faculty._id, name: faculty.name } },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('[faculty/register]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
