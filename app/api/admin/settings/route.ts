import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SystemSettings from "@/models/SystemSettings";

export async function GET() {
    try {
        await dbConnect();
        let settings = await SystemSettings.findOne({ key: 'global' });

        if (!settings) {
            settings = await SystemSettings.create({ key: 'global' });
        }

        return NextResponse.json({ settings });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Remove key/id from update body to prevent immutable field errors
        const { _id, key, ...updateData } = body;

        const settings = await SystemSettings.findOneAndUpdate(
            { key: 'global' },
            { $set: { ...updateData, updatedAt: new Date() } },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
