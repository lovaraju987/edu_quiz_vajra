import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/db';
import QuizResult from '@/models/QuizResult';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const data = await req.json();

        // Set results release time to 8:30 PM of quiz date
        const quizDate = data.attemptDate ? new Date(data.attemptDate) : new Date();
        const releaseTime = new Date(quizDate);
        releaseTime.setHours(20, 30, 0, 0); // 8:30 PM IST

        // Prepare result data with new fields
        // Validate required fields
        if (!data.idNo || !data.score || !data.level) {
            return NextResponse.json({ error: 'Missing required fields: idNo, score, or level' }, { status: 400 });
        }

        // Prepare result data with new fields
        const resultData = {
            studentId: data.studentId || data.idNo, // Fallback if studentId missing
            idNo: data.idNo,
            studentName: data.studentName,
            schoolName: data.schoolName,
            score: data.score,
            totalQuestions: data.totalQuestions,
            level: data.level,
            attemptDate: data.attemptDate || new Date(),
            timeTaken: data.timeTaken || 0,
            submittedAt: new Date(),
            resultsReleasedAt: releaseTime,
        };

        const result = await QuizResult.create(resultData);

        return NextResponse.json({
            message: 'Quiz submitted successfully! Results will be available at 8:30 PM',
            releaseTime: releaseTime.toISOString(),
            submittedAt: result.submittedAt
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error saving quiz result:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const idNo = searchParams.get('idNo');
        const facultyId = searchParams.get('facultyId');

        let query: any = {};
        if (idNo) query.idNo = idNo.toUpperCase();

        // Multi-tenancy: If facultyId is provided, filter students by that faculty first
        if (facultyId) {
            const Student = (await import('@/models/Student')).default;
            const studentIds = await Student.find({ facultyId }).distinct('idNo');
            query.idNo = { $in: studentIds };
        }

        const results = await QuizResult.find(query)
            .sort({ score: -1, attemptDate: -1 })
            .limit(100); // 🚀 Performance: Only return top 100 for high-load leaderboard

        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
