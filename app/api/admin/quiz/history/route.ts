import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Question from "@/models/Question";

// Helper to format date consistent with UI
function formatDate(date: Date) {
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const level = searchParams.get("level");
        const dateStr = searchParams.get("date"); // Optional specific date fetch

        if (!level) return NextResponse.json({ error: "Level required" }, { status: 400 });

        if (dateStr) {
            // Fetch questions for specific date
            // Parse DD/MM/YYYY or YYYY-MM-DD? Assuming ISO/Date object safe parsing
            // But from UI we might send ISO.
            const queryDate = new Date(dateStr);
            const start = new Date(queryDate); start.setHours(0, 0, 0, 0);
            const end = new Date(queryDate); end.setHours(23, 59, 59, 999);

            const questions = await Question.find({
                level: parseInt(level),
                createdAt: { $gte: start, $lte: end }
            });
            return NextResponse.json({ questions });
        }

        // Fetch History List (Grouped by Date)
        // Using Aggregation
        const history = await Question.aggregate([
            { $match: { level: parseInt(level) } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    firstId: { $first: "$_id" } // Just to have a reliable sort key if needed
                }
            },
            { $sort: { _id: -1 } } // Newest dates first
        ]);

        return NextResponse.json({ history });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
