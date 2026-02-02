import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Gift from "@/models/Gift";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { title, description, imageUrl } = body;

        if (!title || !description || !imageUrl) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const gift = await Gift.create({ title, description, imageUrl });
        return NextResponse.json({ success: true, gift }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create gift" }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const gifts = await Gift.find().sort({ createdAt: -1 });
        return NextResponse.json({ gifts });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch gifts" }, { status: 500 });
    }
}
