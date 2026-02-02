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
