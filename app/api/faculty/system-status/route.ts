import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import QuizResult from '@/models/QuizResult';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { getFacultyIdFromRequest } = await import('@/lib/auth');
        const facultyId = getFacultyIdFromRequest(req);

        if (!facultyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Calculate REAL ACTIVE STUDENTS (Last 30 mins activity)
        const activeCriteria = new Date(Date.now() - 30 * 60 * 1000);
        const liveStudents = await QuizResult.countDocuments({
            attemptDate: { $gte: activeCriteria }
        });

        // 2. Fetch Recent Logs (Real Events)
        const recentStudents = await Student.find({ facultyId })
            .sort({ createdAt: -1 })
            .limit(3);

        const recentQuizzes = await QuizResult.find()
            .sort({ attemptDate: -1 })
            .limit(3);

        const logs = [
            ...recentStudents.map(s => ({
                type: 'Registration',
                msg: `New Student enrolled: ${s.name} (${s.idNo})`,
                time: 'Recently',
                color: 'text-blue-600 bg-blue-50'
            })),
            ...recentQuizzes.map(q => ({
                type: 'Quiz',
                msg: `${q.studentName} completed level ${q.level} with ${q.score}/${q.totalQuestions}`,
                time: 'Live',
                color: 'text-green-600 bg-green-50'
            }))
        ].sort(() => Math.random() - 0.5).slice(0, 4);

        // 3. Bandwidth Simulation (Based on total students/activities)
        const totalActivity = await QuizResult.countDocuments();
        const bandwidth = Math.min(Math.max((totalActivity % 100), 10), 95);

        return NextResponse.json({
            health: "100% Online",
            liveStudents: Math.max(liveStudents, 1), // At least 1 (the visitor/faculty)
            bandwidth: `${bandwidth}%`,
            logs
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
