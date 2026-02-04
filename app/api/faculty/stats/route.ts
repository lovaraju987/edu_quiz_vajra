import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import QuizResult from '@/models/QuizResult';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const facultyId = searchParams.get('facultyId');

        if (!facultyId) {
            return NextResponse.json({ error: 'Faculty ID required' }, { status: 400 });
        }

        const totalStudents = await Student.countDocuments({ facultyId });
        const enrolledToday = await Student.countDocuments({
            facultyId,
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        // Total results for this faculty's students
        const students = await Student.find({ facultyId }).select('_id idNo name createdAt').sort({ createdAt: -1 });
        const studentIds = students.map(s => s.idNo);
        const totalQuizResults = await QuizResult.countDocuments({ idNo: { $in: studentIds } });

        // --- REAL ACTIVITY FEED LOGIC ---
        // 1. Get last 5 students
        const recentStudents = students.slice(0, 5).map(s => ({
            type: 'registration',
            title: `New Student Registered: ${s.name}`,
            subtitle: `ID: ${s.idNo}`,
            date: s.createdAt
        }));

        // 2. Get last 5 quiz results
        const recentResults = await QuizResult.find({ idNo: { $in: studentIds } })
            .sort({ attemptDate: -1 })
            .limit(5);

        const formattedResults = recentResults.map(r => ({
            type: 'quiz_completion',
            title: `${r.studentName} completed the quiz`,
            subtitle: `Score: ${r.score}/${r.totalQuestions} (Level ${r.level})`,
            date: r.attemptDate
        }));

        // 3. Combine and sort
        const recentActivities = [...recentStudents, ...formattedResults]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        // --- GLOBAL LIVE PULSE DATA ---
        // Get students active in the last 5 minutes
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        const globalLiveParticipants = await Student.countDocuments({
            lastActiveAt: { $gte: fiveMinsAgo }
        });

        // --- EXAM WINDOW STATUS ---
        const now = new Date();
        const start = new Date(now);
        start.setHours(8, 0, 0, 0);
        const end = new Date(now);
        end.setHours(20, 0, 0, 0);

        let examStatus = "Closed";
        if (now >= start && now <= end) {
            examStatus = "Live";
        } else if (now < start) {
            examStatus = "Opening Soon";
        }

        return NextResponse.json({
            totalStudents,
            enrolledToday,
            totalQuizResults,
            completionRate: totalStudents > 0 ? Math.round((totalQuizResults / totalStudents) * 100) : 0,
            recentActivities,
            globalLiveParticipants,
            examStatus,
            currentTime: now.toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
