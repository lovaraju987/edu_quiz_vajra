"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function DashboardOverview() {
    const [statsData, setStatsData] = useState<any>({
        totalStudents: 0,
        enrolledToday: 0,
        totalQuizResults: 0,
        completionRate: 0,
        recentActivities: [],
        examStatus: 'Live',
        globalLiveParticipants: 0
    });

    const [countdown, setCountdown] = useState("");
    const [progress, setProgress] = useState(0);

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

    const calculateCountdown = (status: string) => {
        const now = new Date();
        const target = new Date();

        if (status === "Opening Soon") {
            target.setHours(8, 0, 0, 0);
            const diff = target.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff / (1000 * 60)) % 60);
            return `starts in ${hours}h ${mins}m`;
        } else if (status === "Live") {
            target.setHours(20, 0, 0, 0);
            const diff = target.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff / (1000 * 60)) % 60);
            return `ends in ${hours}h ${mins}m`;
        } else {
            target.setDate(target.getDate() + 1);
            target.setHours(8, 0, 0, 0);
            const diff = target.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff / (1000 * 60)) % 60);
            return `tomorrow in ${hours}h ${mins}m`;
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            const session = localStorage.getItem("faculty_session");
            const faculty = session ? JSON.parse(session) : null;
            if (faculty) {
                try {
                    const res = await fetch(`/api/faculty/stats?facultyId=${faculty.id}`);
                    const data = await res.json();
                    if (res.ok) {
                        setStatsData(data);
                        const p = Math.min(Math.round((data.globalLiveParticipants / 100) * 100), 100);
                        setProgress(p);
                        setCountdown(calculateCountdown(data.examStatus));
                    }
                } catch (error) {
                    console.error("Failed to fetch stats", error);
                }
            }
        };

        fetchStats();
        const statsInterval = setInterval(fetchStats, 30000); // Poll every 30s
        return () => clearInterval(statsInterval);
    }, []);

    const stats = [
        { name: "Total Students", value: statsData.totalStudents, icon: "👥", change: "Live", color: "text-blue-600 bg-blue-50" },
        { name: "Enrolled Today", value: statsData.enrolledToday, icon: "📝", change: "Daily", color: "text-green-600 bg-green-50" },
        { name: "Quiz Completion", value: `${statsData.completionRate}%`, icon: "✅", change: "Total", color: "text-purple-600 bg-purple-50" },
        { name: "Daily Top 100", value: statsData.examStatus === 'Closed' ? 'Calculating...' : 'Active', icon: "🏆", change: statsData.examStatus === 'Live' ? "Closes 8PM" : "8:00 PM", color: "text-amber-600 bg-amber-50" },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
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
                {/* Recent Activity */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 text-lg">⚡</span>
                        Recent Activity
                    </h3>
                    <div className="space-y-6 flex-1">
                        {statsData.recentActivities?.length > 0 ? (
                            statsData.recentActivities.map((activity: any, i: number) => (
                                <div key={i} className="flex gap-4 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0 group hover:bg-slate-50/50 p-2 rounded-xl transition-colors -mx-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${activity.type === 'registration' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>
                                        {activity.type === 'registration' ? '👤' : '🎯'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{activity.title}</p>
                                        <p className="text-xs text-slate-500 mt-1 font-medium">
                                            {formatRelativeTime(activity.date)} • {activity.subtitle}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                                <span className="text-4xl mb-3 opacity-20">📭</span>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Pulse Card */}
                <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-8 rounded-3xl shadow-xl shadow-blue-900/20 border border-blue-700/50 overflow-hidden relative flex flex-col justify-between min-h-[300px]">

                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 select-none pointer-events-none">
                        <div className="text-[120px] font-black leading-none -mt-10 -mr-10">8:30</div>
                    </div>

                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-bold uppercase tracking-wider mb-4 text-blue-100">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            Live System Status
                        </div>
                        <h3 className="text-2xl font-black mb-2 tracking-tight">Daily Exam Pulse</h3>
                        <p className="text-blue-100/80 text-sm leading-relaxed max-w-sm">
                            {statsData.examStatus === 'Live' ? 'The exam portal is currently ACTIVE and accepting submissions.' :
                                statsData.examStatus === 'Opening Soon' ? 'The exam window will open shortly. Prepare for student influx.' :
                                    'The daily exam window is now closed for new attempts.'}
                        </p>
                    </div>

                    <div className="space-y-6 relative z-10 mt-8">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Next Session</span>
                                <span className="text-2xl font-black font-mono tracking-tight">{countdown}</span>
                            </div>
                        </div>

                        <div className="bg-blue-950/30 rounded-2xl p-4 border border-blue-500/20 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Live Participants</span>
                                <span className="bg-white text-blue-900 px-2 py-0.5 rounded text-xs font-black">{statsData.globalLiveParticipants || 0}</span>
                            </div>
                            <div className="w-full h-1.5 bg-blue-950/50 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-out relative" style={{ width: `${progress}%` }}>
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 animate-ping"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
