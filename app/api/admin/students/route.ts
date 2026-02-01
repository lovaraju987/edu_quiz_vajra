import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";

export async function GET() {
    try {
        await dbConnect();
        const students = await Student.find({}, 'name idNo class school status createdAt')
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
        // Get ID from URL query params or body. For DELETE, usually params or body.
        // Reading body for simplicity in this admin panel context.
        const { id } = await req.json();

        if (!id) return NextResponse.json({ error: "Student ID required" }, { status: 400 });

        await Student.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
    }
}
