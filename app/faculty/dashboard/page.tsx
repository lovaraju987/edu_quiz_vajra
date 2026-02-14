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

    // Teacher Management State
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '' });
    const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<string | null>(null);

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

    const fetchTeachers = async (adminId: string) => {
        try {
            const res = await fetch(`/api/faculty/teachers?adminId=${adminId}`);
            const data = await res.json();
            if (res.ok) setTeachers(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            const session = localStorage.getItem("faculty_session");
            const faculty = session ? JSON.parse(session) : null;
            if (faculty) {
                if (faculty.role === 'admin' && !isAdmin) {
                    setIsAdmin(true);
                    fetchTeachers(faculty.id);
                }

                const res = await fetch(`/api/faculty/stats?facultyId=${faculty.id}`);
                const data = await res.json();
                if (res.ok) {
                    setStatsData(data);
                    const p = Math.min(Math.round((data.globalLiveParticipants / 100) * 100), 100);
                    setProgress(p);
                    setCountdown(calculateCountdown(data.examStatus));
                }
            }
        };

        fetchStats();
        const statsInterval = setInterval(fetchStats, 30000); // Poll every 30s
        return () => clearInterval(statsInterval);
    }, [isAdmin]);

    const handleCreateTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingTeacher(true);
        const session = localStorage.getItem("faculty_session");
        const admin = session ? JSON.parse(session) : null;

        try {
            const res = await fetch('/api/faculty/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newTeacher, adminId: admin?.id })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Teacher ${data.teacher.name} created! Password: ${data.teacher.password}`);
                setTeachers([data.teacher, ...teachers]);
                setNewTeacher({ name: '', email: '', password: '' });
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Failed to create teacher");
        } finally {
            setIsCreatingTeacher(false);
        }
    };

    const handleUpdateTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingTeacher(true);

        try {
            const res = await fetch('/api/faculty/teachers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newTeacher, id: editingTeacher })
            });
            if (res.ok) {
                toast.success("Teacher account updated!");
                setTeachers(teachers.map(t => t._id === editingTeacher ? { ...t, ...newTeacher } : t));
                setNewTeacher({ name: '', email: '', password: '' });
                setEditingTeacher(null);
            } else {
                const data = await res.json();
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setIsCreatingTeacher(false);
        }
    };

    const handleDeleteTeacher = async (id: string) => {
        if (!confirm("Are you sure? This will not delete their students, but they won't be able to login.")) return;
        try {
            const res = await fetch(`/api/faculty/teachers?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTeachers(teachers.filter(t => t._id !== id));
                toast.success("Teacher account removed");
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const stats = [
        { name: "Total Students", value: statsData.totalStudents, icon: "👥", change: "Live", color: "text-blue-600 bg-blue-50" },
        { name: "Enrolled Today", value: statsData.enrolledToday, icon: "📝", change: "Daily", color: "text-green-600 bg-green-50" },
        { name: "Quiz Completion", value: `${statsData.completionRate}%`, icon: "✅", change: "Total", color: "text-purple-600 bg-purple-50" },
        { name: "Daily Top 100", value: statsData.examStatus === 'Closed' ? 'Calculating...' : 'Active', icon: "🏆", change: statsData.examStatus === 'Live' ? "Closes 8PM" : "8:00 PM", color: "text-amber-600 bg-amber-50" },
    ];

    return (
        <div className="space-y-8">
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

            {/* Admin: Manage Teachers Section */}
            {isAdmin && (
                <div id="teachers" className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm scroll-mt-20">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Manage School Teachers</h3>
                            <p className="text-slate-500 text-sm mt-1">Create accounts for your teachers. They will share your school scope.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Create/Edit Form */}
                        <form onSubmit={editingTeacher ? handleUpdateTeacher : handleCreateTeacher} className="lg:col-span-1 space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-2">{editingTeacher ? '✏️ Edit Teacher' : 'Add New Teacher'}</h4>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Teacher Name"
                                    required
                                    value={newTeacher.name}
                                    onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    value={newTeacher.email}
                                    onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder={editingTeacher ? "New Password (Optional)" : "Set Password"}
                                    required={!editingTeacher}
                                    value={newTeacher.password}
                                    onChange={e => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isCreatingTeacher}
                                    className={`flex-1 py-2 text-white font-bold rounded-xl transition shadow-lg ${editingTeacher ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                                >
                                    {isCreatingTeacher ? 'Processing...' : (editingTeacher ? 'Update Teacher' : '+ Create Account')}
                                </button>
                                {editingTeacher && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingTeacher(null);
                                            setNewTeacher({ name: '', email: '', password: '' });
                                        }}
                                        className="px-4 py-2 bg-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-300 transition"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Teachers List */}
                        <div className="lg:col-span-2 space-y-4">
                            <h4 className="font-bold text-slate-800 mb-2">Existing Accounts ({teachers.length})</h4>
                            {teachers.length === 0 ? (
                                <p className="text-slate-400 italic text-sm">No teachers added yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {teachers.map((teacher: any) => (
                                        <div key={teacher._id} className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between items-start group hover:border-blue-300 transition-colors">
                                            <div>
                                                <p className="font-bold text-slate-800">{teacher.name}</p>
                                                <p className="text-xs text-slate-500">{teacher.email}</p>
                                                <p className="text-xs text-blue-500 mt-1 font-mono bg-blue-50 inline-block px-1 rounded">ID: {teacher.uniqueId}</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingTeacher(teacher._id);
                                                        setNewTeacher({ name: teacher.name, email: teacher.email, password: '' });
                                                    }}
                                                    className="text-blue-400 hover:text-blue-600 p-1"
                                                    title="Edit Teacher"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTeacher(teacher._id)}
                                                    className="text-rose-400 hover:text-rose-600 p-1"
                                                    title="Remove Teacher"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                    <p className="text-blue-200 text-sm mb-8">
                        {statsData.examStatus === 'Live' ? 'The exam is currently LIVE.' :
                            statsData.examStatus === 'Opening Soon' ? 'The exam window opens soon.' :
                                'The exam window is now closed.'} Next session {countdown}.
                    </p>

                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-blue-300">Live Participants</span>
                            <span className="font-bold">{statsData.globalLiveParticipants || 0}</span>
                        </div>
                        <div className="w-full h-2 bg-blue-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-blue-300 italic">Tracking real-time student activity</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
