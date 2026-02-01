"use client";

import { useState, useEffect } from "react";

export default function DashboardOverview() {
    const [statsData, setStatsData] = useState<any>({
        totalStudents: 0,
        enrolledToday: 0,
        totalQuizResults: 0,
        completionRate: 0,
        recentActivities: []
    });

    const formatRelativeTime = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now.getTime() - past.getTime();
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMins < 1) return "Just now";
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${diffInDays}d ago`;
    };

    const [countdown, setCountdown] = useState("");
    const [progress, setProgress] = useState(0);

    const calculateCountdown = () => {
        const now = new Date();
        const target = new Date();
        target.setHours(20, 30, 0, 0); // 8:30 PM

        if (now > target) {
            target.setDate(target.getDate() + 1);
        }

        const diff = target.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        return `${hours} hours and ${mins} mins`;
    };

    useEffect(() => {
        const fetchStats = async () => {
            const session = localStorage.getItem("faculty_session");
            const faculty = session ? JSON.parse(session) : null;
            if (faculty) {
                const res = await fetch(`/api/faculty/stats?facultyId=${faculty.id}`);
                const data = await res.json();
                if (res.ok) {
                    setStatsData(data);
                    // Calculate progress based on 1200 target
                    const p = Math.min(Math.round((data.globalDailyAttempts / 1200) * 100), 100);
                    setProgress(p);
                }
            }
        };

        fetchStats();
        setCountdown(calculateCountdown());

        const interval = setInterval(() => {
            setCountdown(calculateCountdown());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const stats = [
        { name: "Total Students", value: statsData.totalStudents, icon: "👥", change: "Live", color: "text-blue-600 bg-blue-50" },
        { name: "Enrolled Today", value: statsData.enrolledToday, icon: "📝", change: "Daily", color: "text-green-600 bg-green-50" },
        { name: "Quiz Completion", value: `${statsData.completionRate}%`, icon: "✅", change: "Total", color: "text-purple-600 bg-purple-50" },
        { name: "Daily Top 100", value: "Updated", icon: "🏆", change: "8:30 PM", color: "text-amber-600 bg-amber-50" },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.name === 'Daily Top 100' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{stat.name}</h3>
                        <p className="text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {statsData.recentActivities?.length > 0 ? (
                            statsData.recentActivities.map((activity: any, i: number) => (
                                <div key={i} className="flex gap-4 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${activity.type === 'registration' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>
                                        {activity.type === 'registration' ? '👤' : '🎯'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{activity.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formatRelativeTime(activity.date)} • {activity.subtitle}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-slate-400 text-sm italic">No recent activity found.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-xl border border-blue-800 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <div className="text-9xl font-black rotate-12">8:30</div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Daily Live Quiz Pulse</h3>
                    <p className="text-blue-200 text-sm mb-8">The next session starts in {countdown}.</p>

                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-blue-300">Live Participants</span>
                            <span className="font-bold">{statsData.globalDailyAttempts || 0}</span>
                        </div>
                        <div className="w-full h-2 bg-blue-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-blue-300 italic">Target capacity: 1,200 students per session</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
