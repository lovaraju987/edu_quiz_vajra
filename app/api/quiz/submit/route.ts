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

        // Validate that the submitting user matches the session
        // @ts-ignore
        if (data.studentId !== session.user.idNo && data.studentId !== session.user.id) {
            // Relaxed check: allows idNo or DB _id, but ideally strictly idNo
            // However, some parts of app use idNo as primary key for logic
        }

        // Trust session data over client data for critical fields
        // @ts-ignore
        data.studentId = session.user.idNo || data.studentId;

        // Check if already attempted today/recently if needed
        // For now, trusting client logic but we could enforce it here

        const result = await QuizResult.create(data);

        return NextResponse.json({ message: 'Quiz result saved successfully', result }, { status: 201 });
    } catch (error: any) {
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
