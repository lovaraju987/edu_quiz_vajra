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
        const students = await Student.find({ facultyId }).select('_id idNo');
        const studentIds = students.map(s => s.idNo);
        const totalQuizResults = await QuizResult.countDocuments({ idNo: { $in: studentIds } });

        return NextResponse.json({
            totalStudents,
            enrolledToday,
            totalQuizResults,
            completionRate: totalStudents > 0 ? Math.round((totalQuizResults / totalStudents) * 100) : 0
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
