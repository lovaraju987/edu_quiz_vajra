import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Question from "@/models/Question";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const level = searchParams.get("level");

        if (!level) return NextResponse.json({ error: "Level required" }, { status: 400 });

        // Get start of today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const questions = await Question.find({
            level: parseInt(level),
            createdAt: { $gte: startOfDay }
        }).sort({ createdAt: -1 });

        return NextResponse.json({ questions });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch active quiz" }, { status: 500 });
    }
}
