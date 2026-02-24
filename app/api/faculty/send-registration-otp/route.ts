import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import AllowedEmail from '@/models/AllowedEmail';
import Faculty from '@/models/Faculty';
import { sendRegistrationOTPEmail } from '@/lib/email';

// 🧪 TESTING MODE: rate limit disabled (re-enable after testing)
function isRateLimited(_email: string): boolean {
    return false;
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, name } = await req.json();

        if (!email || !name) {
            return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (isRateLimited(normalizedEmail)) {
            return NextResponse.json(
                { error: 'Too many OTP requests. Please wait 15 minutes.' },
                { status: 429 }
            );
        }

        // ✅ Check whitelist
        const allowed = await AllowedEmail.findOne({ email: normalizedEmail });
        if (!allowed) {
            return NextResponse.json(
                { error: 'This email is not approved for school registration. Please contact the administrator.' },
                { status: 403 }
            );
        }

        // ✅ Check duplicate account
        const existing = await Faculty.findOne({ email: normalizedEmail });
        if (existing) {
            return NextResponse.json(
                { error: 'An account with this email already exists. Please login.' },
                { status: 409 }
            );
        }

        // ✅ Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 8);

        // ✅ Store hashed OTP in DB (survives hot-reload!)
        await AllowedEmail.findByIdAndUpdate(allowed._id, {
            regOtp: hashedOtp,
            regOtpExpiry: new Date(Date.now() + 30 * 60 * 1000), // 30 min for testing
        });

        // ✅ Send registration OTP email
        await sendRegistrationOTPEmail(normalizedEmail, otp, name.trim());

        return NextResponse.json({ success: true, message: 'Verification OTP sent to your email.' });

    } catch (error: any) {
        console.error('[send-registration-otp]', error?.message || error);
        return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
    }
}

// Keep this export so register/route.ts import doesn't break — but it's no longer used
export const registrationOtpStore = new Map();
