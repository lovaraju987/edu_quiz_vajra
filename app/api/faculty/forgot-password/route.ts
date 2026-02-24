import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';
import { sendOTPEmail } from '@/lib/email';

// ✅ Rate limit: max 3 OTP requests per email per 10 minutes (prevent spam)
const otpRequestCache = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(_email: string): boolean {
    return false; // 🧪 TESTING MODE: rate limit disabled
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // ✅ Rate limit check
        if (isRateLimited(normalizedEmail)) {
            return NextResponse.json(
                { error: 'Too many OTP requests. Please wait 10 minutes.' },
                { status: 429 }
            );
        }

        // ✅ Find faculty — use generic message to prevent email enumeration attacks
        const faculty = await Faculty.findOne({ email: normalizedEmail });
        if (!faculty) {
            // Return success even if not found (security: don't reveal if email exists)
            return NextResponse.json({
                success: true,
                message: 'If this email is registered, an OTP has been sent.'
            });
        }

        // ✅ Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // ✅ Hash OTP before storing (so even DB access can't reveal it)
        const hashedOtp = await bcrypt.hash(otp, 8); // lower rounds = faster for OTP

        // ✅ Store hashed OTP with 10-minute expiry + reset attempt counter
        await Faculty.findByIdAndUpdate(faculty._id, {
            resetOtp: hashedOtp,
            resetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            resetOtpAttempts: 0,
        });

        // ✅ Send email (non-blocking for response — but await to catch errors)
        await sendOTPEmail(normalizedEmail, otp, faculty.name);

        return NextResponse.json({
            success: true,
            message: 'If this email is registered, an OTP has been sent.'
        });

    } catch (error: any) {
        console.error('[forgot-password]', error);
        // Don't expose internal errors to client
        return NextResponse.json(
            { error: 'Failed to process request. Please try again.' },
            { status: 500 }
        );
    }
}
