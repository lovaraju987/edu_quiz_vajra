import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import QuizResult from '@/models/QuizResult';
import SystemSettings from '@/models/SystemSettings';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        let idNo = searchParams.get('idNo');

        // Allow Admin/Faculty to view any student, but for Students, enforce self-view
        // For now, assuming only students access this route or we trust session
        // @ts-ignore
        if (session.user.role === 'student' && idNo && idNo.toUpperCase() !== session.user.idNo?.toUpperCase()) {
            // If mismatch, default to session ID to be safe or error
            // @ts-ignore
            idNo = session.user.idNo;
        }

        // If no ID provided, use session ID
        if (!idNo) {
            // @ts-ignore
            idNo = session.user.idNo;
        }

        if (!idNo) {
            return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
        }

        await dbConnect();

        // 1. Get Student Profile
        const student = await Student.findOne({ idNo: idNo.toUpperCase() }).lean();
        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // 2. Get Quiz History (Last 10 attempts)
        const quizHistory = await QuizResult.find({ idNo: idNo.toUpperCase() })
            .sort({ attemptDate: -1 })
            .limit(10)
            .lean();

        // 3. Calculate Stats
        const totalQuizzes = quizHistory.length;
        const avgScore = totalQuizzes > 0
            ? Math.round(
                quizHistory.reduce((sum: any, q: any) => sum + (q.score / q.totalQuestions) * 100, 0) / totalQuizzes
            )
            : 0;

        // 4. Calculate Participation Streak (count unique days in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentAttempts = await QuizResult.find({
            idNo: idNo.toUpperCase(),
            attemptDate: { $gte: thirtyDaysAgo }
        }).lean();

        const uniqueDays = new Set(
            recentAttempts.map((q: any) => new Date(q.attemptDate).toDateString())
        );
        const participationStreak = uniqueDays.size;

        // 5. Calculate 365-day participation (for scholarship eligibility)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const yearAttempts = await QuizResult.find({
            idNo: idNo.toUpperCase(),
            attemptDate: { $gte: oneYearAgo }
        }).lean();

        const yearlyUniqueDays = new Set(
            yearAttempts.map((q: any) => new Date(q.attemptDate).toDateString())
        );
        const yearlyStreak = yearlyUniqueDays.size;

        // 6. Determine Rewards Eligibility
        let rewardsStatus = {
            daily: totalQuizzes > 0,
            monthly: participationStreak >= 30,
            yearly: yearlyStreak >= 365
        };

        // 7. Check if student can take quiz today (within time window)
        const settings = await SystemSettings.findOne({ key: 'global' });
        const quizStartTime = settings?.quizStartTime || "06:00";
        const quizEndTime = settings?.quizEndTime || "20:00";
        const quizDuration = settings?.quizDuration || 900;

        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Convert start/end times to Date objects for comparison
        const [startH, startM] = quizStartTime.split(':').map(Number);
        const [endH, endM] = quizEndTime.split(':').map(Number);

        const startTimeDate = new Date(today);
        startTimeDate.setHours(startH, startM, 0, 0);

        const endTimeDate = new Date(today);
        endTimeDate.setHours(endH, endM, 0, 0);

        const todayAttempt = await QuizResult.findOne({
            idNo: idNo.toUpperCase(),
            attemptDate: { $gte: today, $lt: tomorrow }
        });

        const isWithinWindow = now >= startTimeDate && now <= endTimeDate;
        const canTakeQuiz = !todayAttempt && isWithinWindow;
        const nextAvailable = !todayAttempt && now < startTimeDate ? startTimeDate.toISOString() : tomorrow.toISOString();

        // 8. Get Today's Top Rankers & User Rank
        const topRankers = await QuizResult.find({
            attemptDate: { $gte: today, $lt: tomorrow }
        })
            .sort({ score: -1, timeTaken: 1 })
            .limit(10)
            .select('studentName score totalQuestions timeTaken')
            .lean();

        // Calculate user's rank if they attempted today
        let userRank: any = 'TBD';
        if (todayAttempt) {
            // Count how many people have better score or same score with less time
            const betterScorers = await QuizResult.countDocuments({
                attemptDate: { $gte: today, $lt: tomorrow },
                $or: [
                    { score: { $gt: todayAttempt.score } },
                    { score: todayAttempt.score, timeTaken: { $lt: todayAttempt.timeTaken } }
                ]
            });
            userRank = betterScorers + 1;
        }

        return NextResponse.json({
            student: {
                name: student.name,
                idNo: student.idNo,
                level: student.level,
                schoolName: student.schoolName,
                className: student.className
            },
            stats: {
                totalQuizzes,
                avgScore,
                participationStreak,
                yearlyStreak,
                rank: userRank
            },
            rankers: topRankers.map((r: any) => ({
                name: r.studentName || 'Anonymous',
                score: `${r.score}/${r.totalQuestions}`,
                time: `${Math.round(r.timeTaken / 60)}m`
            })),
            quizHistory: quizHistory.map((q: any) => ({
                date: new Date(q.attemptDate).toLocaleDateString(),
                score: q.score,
                total: q.totalQuestions,
                percentage: Math.round((q.score / q.totalQuestions) * 100),
                level: q.level
            })),
            rewards: rewardsStatus,
            quizAvailability: {
                canTakeQuiz,
                nextAvailable,
                startTime: quizStartTime,
                endTime: quizEndTime,
                isWithinWindow,
                hasAttemptedToday: !!todayAttempt
            }
        });

    } catch (error: any) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
