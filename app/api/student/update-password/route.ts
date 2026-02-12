import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { password } = await req.json();

        if (!password || password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        await dbConnect();

        // Check if student exists
        // @ts-ignore
        const studentId = session.user.id || session.user.idNo;

        // Find using _id or idNo (handling possible schema variations)
        const student = await Student.findOne({
            $or: [
                { _id: studentId },
                // @ts-ignore
                { idNo: session.user.idNo }
            ]
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update using raw collection to bypass any Mongoose schema validation issues
        const updateResult = await Student.collection.updateOne(
            { _id: student._id },
            {
                $set: {
                    password: hashedPassword,
                    isFirstLogin: false
                },
                $unset: {
                    displayPassword: ""
                }
            }
        );
        console.log("Password Update - Student:", student.idNo, "Result:", updateResult);

        return NextResponse.json({ message: 'Password updated successfully' });

    } catch (error: any) {
        console.error('Error updating password:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
