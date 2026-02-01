import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizResult from '@/models/QuizResult';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const data = await req.json();

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

        let query: any = {};

        // 1. JWT Security for Faculty Access
        const { getFacultyIdFromRequest } = await import('@/lib/auth');
        const authenticatedFacultyId = getFacultyIdFromRequest(req);

        if (authenticatedFacultyId) {
            // If faculty is logged in, show their students' results
            const Student = (await import('@/models/Student')).default;
            const studentIds = await Student.find({ facultyId: authenticatedFacultyId }).distinct('idNo');
            query.idNo = { $in: studentIds };

            // If they also filtered by a specific ID, apply it
            if (idNo) query.idNo = idNo.toUpperCase();
        } else if (idNo) {
            // 2. Public Access for Students (Specific ID only)
            query.idNo = idNo.toUpperCase();
        } else {
            // Block anonymous access to the full database
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const results = await QuizResult.find(query)
            .sort({ score: -1, attemptDate: -1 })
            .limit(100); // 🚀 Performance: Only return top 100 for high-load leaderboard

        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
