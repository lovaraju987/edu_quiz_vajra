import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { idNo, currentPassword, newPassword } = await req.json();

        if (!idNo || !currentPassword || !newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const student = await Student.findOne({ idNo });
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, student.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update student: Set new password, clear displayPassword, set isFirstLogin false
        student.password = hashedNewPassword;
        student.displayPassword = undefined; // Clear the temporary admin-viewable password
        student.isFirstLogin = false;
        await student.save();

        return NextResponse.json({
            success: true,
            message: "Password updated successfully. Please login again."
        });

    } catch (error: any) {
        console.error("Update Password Error:", error);
        return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
    }
}
