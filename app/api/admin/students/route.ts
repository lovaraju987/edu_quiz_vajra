import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";

// ... imports

export async function GET() {
    try {
        await dbConnect();
        const students = await (Student as any).find({}, 'name idNo class school status createdAt')
            .sort({ createdAt: -1 })
            .limit(100); // Limit to 100 for now to prevent overload

        return NextResponse.json({ students });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { name, class: studentClass, school } = body;

        if (!name || !studentClass || !school) {
            return NextResponse.json({ error: "Name, Class, and School are required" }, { status: 400 });
        }

        // 1. Auto-Generate ID: EQ-YEAR-SEQ (e.g., EQ-2024-001)
        const year = new Date().getFullYear();
        const prefix = `EQ-${year}-`;

        // Find the last student created this year to increment sequence
        const lastStudent = await (Student as any).findOne({ idNo: { $regex: `^${prefix}` } })
            .sort({ idNo: -1 })
            .select('idNo');

        let nextSeq = 1;
        if (lastStudent && lastStudent.idNo) {
            const parts = lastStudent.idNo.split('-');
            const lastSeq = parseInt(parts[parts.length - 1]);
            if (!isNaN(lastSeq)) {
                nextSeq = lastSeq + 1;
            }
        }

        const idNo = `${prefix}${String(nextSeq).padStart(3, '0')}`;

        // 2. Generate Random Password (6 chars alphanumeric)
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars like I, 1, O, 0
        let tempPassword = "";
        for (let i = 0; i < 6; i++) {
            tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // 3. Hash Password
        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // 4. Create Student
        const newStudent = await (Student as any).create({
            name,
            idNo,
            class: studentClass,
            school,
            password: hashedPassword,
            displayPassword: tempPassword, // Stored for admin viewing (Eye icon)
            isFirstLogin: true,
            status: "Active"
        });

        return NextResponse.json({
            success: true,
            student: newStudent,
            credentials: { idNo, password: tempPassword } // Return to admin for display
        });

    } catch (error: any) {
        console.error("Create Student Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create student" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { id } = await req.json();

        if (!id) return NextResponse.json({ error: "Student ID required" }, { status: 400 });

        await (Student as any).findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const { id, ...updateData } = await req.json();

        if (!id) return NextResponse.json({ error: "Student ID required" }, { status: 400 });

        const updatedStudent = await (Student as any).findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedStudent) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, student: updatedStudent });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
    }
}
