import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Faculty from "@/models/Faculty";

export async function GET() {
    try {
        await dbConnect();
        const faculty = await Faculty.find({})
            .sort({ createdAt: -1 });

        return NextResponse.json({ faculty });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const { id, isProfileActive } = await req.json();

        if (!id) return NextResponse.json({ error: "Faculty ID required" }, { status: 400 });

        const updatedFaculty = await Faculty.findByIdAndUpdate(
            id,
            { isProfileActive },
            { new: true }
        );

        return NextResponse.json({ success: true, faculty: updatedFaculty });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update faculty" }, { status: 500 });
    }
}
