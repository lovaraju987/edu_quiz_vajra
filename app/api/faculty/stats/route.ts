import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import QuizResult from '@/models/QuizResult';
import SystemSettings from '@/models/SystemSettings';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const facultyId = searchParams.get('facultyId');

        // --- PART 1: GLOBAL PULSE (For Status Page) ---
        // 1. Fetch System Settings SAFELY
        let settings = await SystemSettings.findOne({ key: 'global' }).lean();

        const defaultSettings = {
            maintenanceMode: false,
            quizStartTime: '06:00',
            quizEndTime: '20:00',
            resultsReleaseTime: '20:30'
        };

        // Merge defaults to prevent crashes if fields are missing in DB doc
        settings = { ...defaultSettings, ...settings };

        // 2. Global Active Live Students (Last 15 Minutes)
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const activeLive = await Student.countDocuments({
            lastActiveAt: { $gte: fifteenMinsAgo }
        });

        // 3. Determine System Phase
        const now = new Date();
        // Safe access guaranteed by defaults
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

        // 4. Logs Construction
        const logs = [
            { type: statusPhase, msg: statusMsg, time: "Now", color: statusColor },
            { type: "Schedule", msg: `Daily Quiz Window: ${settings.quizStartTime} - ${settings.quizEndTime}`, time: "Daily", color: "text-blue-600 bg-blue-50" },
            { type: "Info", msg: `Results Release at ${settings.resultsReleaseTime || '20:30'}`, time: "Info", color: "text-amber-600 bg-amber-50" }
        ];

        // --- PART 2: SCHOOL SPECIFIC STATS (For Dashboard Overview) ---
        let schoolStats = {};
        if (facultyId) {
            const totalStudents = await Student.countDocuments({ facultyId });
            const enrolledToday = await Student.countDocuments({
                facultyId,
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            });

            // Get results via ID mapping
            const students = await Student.find({ facultyId }).select('idNo name createdAt');
            const studentIds = students.map((s: any) => s.idNo);
            const totalQuizResults = await QuizResult.countDocuments({ idNo: { $in: studentIds } });

            // Recent Activities Logic
            const recentStudents = students
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

            schoolStats = {
                totalStudents,
                enrolledToday,
                totalQuizResults,
                completionRate: totalStudents > 0 ? Math.round((totalQuizResults / totalStudents) * 100) : 0,
                recentActivities
            };
        }

        return NextResponse.json({
            // Global Status Data
            serverHealth: "100% Online",
            activeLive,
            bandwidthPercent: Math.min(Math.round((activeLive / 2000) * 100), 100) || 5,
            settings,
            logs,

            // Backward Compatibility / Dashboard Data
            globalLiveParticipants: activeLive,
            examStatus: statusPhase === "Upcoming" ? "Opening Soon" : statusPhase,
            currentTime: now.toISOString(),

            // Merged School Data (if facultyId provided)
            ...schoolStats
        });

    } catch (error: any) {
        console.error("Stats API Error details:", error); // Improved logging
        return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
    }
}
