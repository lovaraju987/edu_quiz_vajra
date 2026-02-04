"use client";
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch stats", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Real-time overview of your platform's performance</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors flex items-center gap-2"
                    >
                        <span>📄</span> Download Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={data?.stats?.totalStudents?.toLocaleString() || "0"}
                    trend="Live"
                    icon="🎓"
                    color="bg-blue-600"
                />
                <StatCard
                    title="Faculty Members"
                    value={data?.stats?.totalFaculty?.toLocaleString() || "0"}
                    trend="Real-time"
                    icon="👨‍🏫"
                    color="bg-indigo-600"
                />
                <StatCard
                    title="Quizzes Taken"
                    value={data?.stats?.totalQuizzes?.toLocaleString() || "0"}
                    trend="New"
                    icon="📝"
                    color="bg-emerald-600"
                />
                <StatCard
                    title="Avg. Score"
                    value={data?.stats?.avgScore || "0%"}
                    trend="Global"
                    icon="📈"
                    color="bg-amber-600"
                />
            </div>

            {/* Quick Actions / Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Registrations</h3>
                    <div className="space-y-4">
                        {data?.recentStudents?.length > 0 ? (
                            data.recentStudents.map((student: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl transition-all border-b border-white last:border-0 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-bold text-slate-500 shadow-sm group-hover:scale-110 transition-transform">
                                            {student.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{student.name}</div>
                                            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{student.class} • {student.school}</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-green-600 bg-green-100 px-3 py-1 rounded-lg uppercase tracking-widest">
                                        {student.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-400 font-medium bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 italic">
                                No recent registrations found.
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-fit">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">System Health</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Database</span>
                            </div>
                            <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-md">{data?.dbStatus || "Operational"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">AI Service</span>
                            </div>
                            <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-md">{data?.aiStatus || "Operational"}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-50">
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Latest Connection</div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <span className="text-lg">📡</span>
                                <span className="text-xs font-bold text-slate-600">Secure MongoDB TLS active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

function StatCard({ title, value, trend, icon, color }: any) {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:translate-y-[-4px] transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-3xl text-white shadow-2xl shadow-blue-900/20 group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {trend}
                </span>
            </div>
            <div>
                <div className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</div>
                <div className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{value}</div>
            </div>
        </div>
    )
}
