import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import QuizResult from '@/models/QuizResult';
import SystemSettings from '@/models/SystemSettings';
import Faculty from '@/models/Faculty';
import Teacher from '@/models/Teacher';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const facultyId = searchParams.get('facultyId');

        if (!facultyId || !mongoose.Types.ObjectId.isValid(facultyId)) {
            return NextResponse.json({ error: 'Invalid Faculty ID format' }, { status: 400 });
        }

        const objId = new mongoose.Types.ObjectId(facultyId);

        // --- PART 1: GLOBAL PULSE ---
        let settings = await SystemSettings.findOne({ key: 'global' }).lean();
        const defaultSettings = {
            maintenanceMode: false,
            quizStartTime: '06:00',
            quizEndTime: '20:00',
            resultsReleaseTime: '20:30'
        };
        settings = { ...defaultSettings, ...settings };

        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const activeLive = await Student.countDocuments({
            lastActiveAt: { $gte: fifteenMinsAgo }
        });

        const now = new Date();
        const [startH, startM] = (settings.quizStartTime || '06:00').split(':').map(Number);
        const [endH, endM] = (settings.quizEndTime || '20:00').split(':').map(Number);

        const startTime = new Date(now); startTime.setHours(startH, startM, 0, 0);
        const endTime = new Date(now); endTime.setHours(endH, endM, 0, 0);

        let statusPhase = "Closed";
        let statusMsg = "Quiz Server is Offline";
        let statusColor = "text-slate-600 bg-slate-50";

        if (settings.maintenanceMode) {
            statusPhase = "Maintenance";
            statusMsg = "System Under Maintenance";
            statusColor = "text-red-600 bg-red-50";
        } else if (now >= startTime && now <= endTime) {
            statusPhase = "Live";
            statusMsg = "Main Quiz Server is Operational";
            statusColor = "text-green-600 bg-green-50";
        } else if (now < startTime) {
            statusPhase = "Upcoming";
            statusMsg = `Next Quiz starts at ${settings.quizStartTime}`;
            statusColor = "text-blue-600 bg-blue-50";
        } else {
            statusPhase = "Results Reading";
            statusMsg = "Quiz Closed. Processing Results.";
            statusColor = "text-purple-600 bg-purple-50";
        }

        const logs = [
            { type: statusPhase, msg: statusMsg, time: "Now", color: statusColor },
            { type: "Schedule", msg: `Daily Quiz Window: ${settings.quizStartTime} - ${settings.quizEndTime}`, time: "Daily", color: "text-blue-600 bg-blue-50" },
            { type: "Info", msg: `Results Release at ${settings.resultsReleaseTime || '20:30'}`, time: "Info", color: "text-amber-600 bg-amber-50" }
        ];

        // --- PART 2: SCHOOL SPECIFIC STATS ---
        let schoolStats = {};

        console.log('[DEBUG-STATS] Checking user:', facultyId);

        // 🔍 Direct Database Query as Fallback to Mongoose Models
        const db = mongoose.connection.db;
        let userData = await db.collection('faculties').findOne({ _id: objId });
        let userRole = userData?.role || 'admin';

        if (!userData) {
            userData = await db.collection('teachers').findOne({ _id: objId });
            if (userData) userRole = 'teacher';
        }

        if (!userData) {
            console.error('[STATS FATAL ERROR] User ID not found in ANY collection:', facultyId);
            return NextResponse.json({ error: 'Account not found in database. Please log out and log in again.' }, { status: 404 });
        }

        console.log('[DEBUG-STATS] Found User:', userData.name, 'Role:', userRole);

        const isAdmin = userRole === 'admin';
        const studentQuery: any = isAdmin
            ? { $or: [{ facultyId: objId }, { school: userData.schoolName }] }
            : { facultyId: objId };

        const totalStudents = await Student.countDocuments(studentQuery);
        console.log('[DEBUG-STATS] Total Students for', userData.name, ':', totalStudents);

        const enrolledToday = await Student.countDocuments({
            ...studentQuery,
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        const students = await Student.find(studentQuery).select('idNo name createdAt');
        const studentIds = students.map((s: any) => s.idNo);
        const totalQuizResults = await QuizResult.countDocuments({ idNo: { $in: studentIds } });

        const recentStudents = [...students]
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((s: any) => ({
                type: 'registration',
                title: `New Student Registered: ${s.name}`,
                subtitle: `ID: ${s.idNo}`,
                date: s.createdAt
            }));

        const recentResults = await QuizResult.find({ idNo: { $in: studentIds } })
            .sort({ attemptDate: -1 })
            .limit(5);

        const formattedResults = recentResults.map((r: any) => ({
            type: 'quiz_completion',
            title: `${r.studentName || 'Student'} completed the quiz`,
            subtitle: `Score: ${r.score}/${r.totalQuestions} (Level ${r.level})`,
            date: r.attemptDate
        }));

        const recentActivities = [...recentStudents, ...formattedResults]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        // --- PART 3: SUBJECT PROFICIENCY ---
        const resultsForAnalytics = await QuizResult.find({ idNo: { $in: studentIds } }).select('categoryScores');
        const categoryTotals: any = {};
        const categoryCounts: any = {};

        resultsForAnalytics.forEach((res: any) => {
            if (res.categoryScores) {
                const scores = res.categoryScores instanceof Map ? Object.fromEntries(res.categoryScores) : res.categoryScores;
                Object.entries(scores).forEach(([cat, score]: any) => {
                    const normalizedCat = cat.toUpperCase();
                    categoryTotals[normalizedCat] = (categoryTotals[normalizedCat] || 0) + score;
                    categoryCounts[normalizedCat] = (categoryCounts[normalizedCat] || 0) + 5; // assumes 5 questions per category
                });
            }
        });

        const categoryAnalytics = Object.keys(categoryTotals).map(cat => ({
            subject: cat,
            percentage: Math.round((categoryTotals[cat] / categoryCounts[cat]) * 100)
        }));

        schoolStats = {
            totalStudents,
            enrolledToday,
            totalQuizResults,
            completionRate: totalStudents > 0 ? Math.round((totalQuizResults / totalStudents) * 100) : 0,
            recentActivities,
            categoryAnalytics
        };

        return NextResponse.json({
            serverHealth: "100% Online",
            activeLive,
            bandwidthPercent: Math.min(Math.round((activeLive / 2000) * 100), 100) || 5,
            settings,
            logs,
            globalLiveParticipants: activeLive,
            examStatus: statusPhase === "Upcoming" ? "Opening Soon" : statusPhase,
            currentTime: now.toISOString(),
            ...schoolStats
        });

    } catch (error: any) {
        console.error("Stats API Final Crash:", error);
        return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
    }
}
