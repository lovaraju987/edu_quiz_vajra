import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, resetToken, newPassword } = await req.json();

        if (!email || !resetToken || !newPassword) {
            return NextResponse.json(
                { error: 'Email, reset token and new password are required' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Hash the incoming reset token to compare with stored value
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expectedStored = `VERIFIED:${hashedResetToken}`;

        // Find faculty with matching verified token that hasn't expired
        const faculty = await Faculty.findOne({
            email: normalizedEmail,
            resetOtp: expectedStored,
            resetOtpExpiry: { $gt: new Date() }, // still valid (5 min window)
        });

        if (!faculty) {
            return NextResponse.json(
                { error: 'Reset session has expired. Please start over.' },
                { status: 400 }
            );
        }

        // ✅ Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // ✅ Update password + clear all OTP/reset fields atomically
        await Faculty.findByIdAndUpdate(faculty._id, {
            password: hashedPassword,
            resetOtp: null,
            resetOtpExpiry: null,
            resetOtpAttempts: 0,
        });

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully. You can now login.'
        });

    } catch (error: any) {
        console.error('[reset-password]', error);
        return NextResponse.json(
            { error: 'Failed to reset password. Please try again.' },
            { status: 500 }
        );
    }
}
