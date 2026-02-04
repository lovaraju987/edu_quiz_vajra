import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import Faculty from '@/models/Faculty';
import QuizResult from '@/models/QuizResult';

export async function GET() {
    try {
        await dbConnect();

        // 1. Basic Counts
        const totalStudents = await Student.countDocuments();
        const totalFaculty = await Faculty.countDocuments();
        const totalQuizzes = await QuizResult.countDocuments();

        // 2. Average Score Calculation
        const avgScoreData = await QuizResult.aggregate([
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: "$score" },
                    totalPossible: { $avg: "$totalQuestions" }
                }
            }
        ]);

        let avgScorePercent = 0;
        if (avgScoreData.length > 0) {
            // If totalPossible is 25, and avgScore is 20, percent is (20/25)*100
            const avg = avgScoreData[0].avgScore || 0;
            const possible = avgScoreData[0].totalPossible || 25;
            avgScorePercent = Math.round((avg / possible) * 100);
        }

        // 3. Recent Registrations (Last 5 students)
        const recentStudents = await (Student as any).find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // 4. Trends (Mocking trends for now as we don't have historical snapshots yet, 
        // but real numbers for totals)
        return NextResponse.json({
            stats: {
                totalStudents,
                totalFaculty,
                totalQuizzes,
                avgScore: `${avgScorePercent}%`
            },
            recentStudents: recentStudents.map((s: any) => ({
                id: s._id,
                name: s.name,
                class: s.className || "Class " + s.level,
                school: s.schoolName || "N/A",
                status: "Active"
            })),
            dbStatus: "Connected",
            aiStatus: "Operational"
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
