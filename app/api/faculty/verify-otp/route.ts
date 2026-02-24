import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find faculty with valid (non-expired) OTP
        const faculty = await Faculty.findOne({
            email: normalizedEmail,
            resetOtp: { $ne: null },
            resetOtpExpiry: { $gt: new Date() }, // not expired
        });

        if (!faculty) {
            return NextResponse.json(
                { error: 'OTP has expired or is invalid. Please request a new one.' },
                { status: 400 }
            );
        }

        // ✅ Brute force protection — max 5 wrong attempts
        if (faculty.resetOtpAttempts >= 5) {
            // Clear OTP to force re-request
            await Faculty.findByIdAndUpdate(faculty._id, {
                resetOtp: null,
                resetOtpExpiry: null,
                resetOtpAttempts: 0,
            });
            return NextResponse.json(
                { error: 'Too many incorrect attempts. Please request a new OTP.' },
                { status: 429 }
            );
        }

        // ✅ Verify OTP against hashed value
        const isValid = await bcrypt.compare(otp.toString().trim(), faculty.resetOtp);

        if (!isValid) {
            // Increment attempt counter
            await Faculty.findByIdAndUpdate(faculty._id, {
                $inc: { resetOtpAttempts: 1 }
            });
            const remaining = 4 - faculty.resetOtpAttempts;
            return NextResponse.json(
                { error: `Incorrect OTP. ${remaining} attempt(s) remaining.` },
                { status: 400 }
            );
        }

        // ✅ OTP is correct — generate a short-lived reset token (5 minutes)
        // This token is used on the next screen to actually reset the password
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Store reset token (replaces OTP) — valid 5 minutes
        await Faculty.findByIdAndUpdate(faculty._id, {
            resetOtp: `VERIFIED:${hashedResetToken}`,     // mark as verified
            resetOtpExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            resetOtpAttempts: 0,
        });

        return NextResponse.json({
            success: true,
            resetToken,  // send plain token to client (stored in sessionStorage)
            message: 'OTP verified successfully'
        });

    } catch (error: any) {
        console.error('[verify-otp]', error);
        return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
    }
}
