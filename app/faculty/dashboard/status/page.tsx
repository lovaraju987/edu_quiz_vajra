"use client";
import { useState, useEffect } from "react";

export default function ProgramStatus() {
    const [stats, setStats] = useState({
        serverHealth: "Checking...",
        activeLive: 0,
        bandwidthPercent: 0,
        logs: [] as any[],
        completionRate: 0,
        examStatus: 'Live',
        totalStudents: 0,
        enrolledToday: 0
    });

    const [countdown, setCountdown] = useState("");
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [broadcastType, setBroadcastType] = useState("info");
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [activeBroadcasts, setActiveBroadcasts] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const session = localStorage.getItem("faculty_session");
            const faculty = session ? JSON.parse(session) : null;
            if (!faculty || !faculty.id) return;

            try {
                const res = await fetch(`/api/faculty/stats?facultyId=${faculty.id}&t=${Date.now()}`);
                const data = await res.json();
                if (res.ok && !data.error) {
                    setStats({
                        serverHealth: data.serverHealth || "Online",
                        activeLive: data.activeLive || 0,
                        bandwidthPercent: data.bandwidthPercent || 5,
                        logs: data.logs || [],
                        completionRate: data.completionRate || 0,
                        examStatus: data.examStatus || 'Live',
                        totalStudents: data.totalStudents || 0,
                        enrolledToday: data.enrolledToday || 0
                    });

                    // Update countdown if possible
                    if (data.currentTime) {
                        const now = new Date(data.currentTime);
                        const target = new Date(now);
                        if (data.examStatus === 'Live') {
                            target.setHours(20, 0, 0, 0); // Closes at 8 PM
                        } else {
                            target.setDate(target.getDate() + 1);
                            target.setHours(8, 0, 0, 0); // Opens at 8 AM
                        }
                        const diff = target.getTime() - now.getTime();
                        const h = Math.floor(diff / (1000 * 60 * 60));
                        const m = Math.floor((diff / (1000 * 60)) % 60);
                        setCountdown(`${h}h ${m}m`);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch status:", error);
            }
        };

        fetchStats();

        const fetchBroadcasts = async () => {
            try {
                const res = await fetch('/api/admin/broadcast');
                const data = await res.json();
                if (Array.isArray(data)) setActiveBroadcasts(data);
            } catch (err) { }
        };
        fetchBroadcasts();

        const interval = setInterval(() => {
            fetchStats();
            fetchBroadcasts();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSendBroadcast = async () => {
        if (!broadcastMsg.trim()) return;
        setIsBroadcasting(true);
        try {
            const session = localStorage.getItem("faculty_session");
            const faculty = session ? JSON.parse(session) : null;

            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: broadcastMsg,
                    type: broadcastType,
                    facultyId: faculty?.id
                })
            });
            if (res.ok) {
                setBroadcastMsg("");
                // Refresh list
                const data = await (await fetch('/api/admin/broadcast')).json();
                if (Array.isArray(data)) setActiveBroadcasts(data);
            }
        } catch (err) { } finally {
            setIsBroadcasting(false);
        }
    };

    const handleDeleteBroadcast = async (id: string) => {
        try {
            await fetch(`/api/admin/broadcast?id=${id}`, { method: 'DELETE' });
            setActiveBroadcasts(prev => prev.filter(b => b._id !== id));
        } catch (err) { }
    };

    const services = [
        { name: "Record Keeping", status: "Operational", icon: "🗄️", color: "text-emerald-500" },
        { name: "Secure Login", status: "Active", icon: "🛡️", color: "text-blue-500" },
        { name: "Email Notifications", status: "Active", icon: "📧", color: "text-amber-500" },
        { name: "Portal Performance", status: "Optimized", icon: "🌐", color: "text-purple-500" },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* --- Main Dashboard --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* System Pulse Card */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <span className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl">⚡</span>
                                System Vitality
                            </h2>
                            <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest">Global Infrastructure Monitoring</p>
                        </div>
                        <div className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                            Live Mode
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Server Health */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <span>Core Server</span>
                                <span className="text-emerald-500">100%</span>
                            </div>
                            <div className="p-5 bg-slate-50/80 rounded-3xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.serverHealth}</p>
                                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">Uptime: 99.99%</p>
                            </div>
                        </div>

                        {/* Active Students */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <span>Live Traffic</span>
                                <span className="text-indigo-500">Peak Load</span>
                            </div>
                            <div className="p-5 bg-slate-50/80 rounded-3xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                <p className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                    <span className="text-orange-500">🔥</span> {stats.activeLive} <span className="text-sm font-bold text-slate-400 uppercase">Users</span>
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">Real-time Pulse</p>
                            </div>
                        </div>

                        {/* Bandwidth Usage */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <span>Data Stream</span>
                                <span className="text-blue-500">{stats.bandwidthPercent}%</span>
                            </div>
                            <div className="p-5 bg-slate-50/80 rounded-3xl border border-slate-100 italic">
                                <div className="w-full bg-slate-200 h-2.5 rounded-full mt-2 group relative overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.3)] transition-all duration-1000 ease-out"
                                        style={{ width: `${stats.bandwidthPercent}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase text-center tracking-tighter">Throughput Optimized</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-50">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 ml-1">Critical Event Log</h3>
                        <div className="space-y-3">
                            {stats.logs && stats.logs.length > 0 ? (
                                stats.logs.map((alert: any, i: number) => (
                                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${alert.color || "bg-slate-50 border-slate-100 text-slate-500"}`}>
                                        <div className="flex items-center gap-4">
                                            <span className="font-black text-[9px] uppercase px-2 py-1 bg-white/60 rounded-lg shadow-sm">{alert.type}</span>
                                            <p className="font-bold text-xs tracking-tight">{alert.msg}</p>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60 font-mono">{alert.time}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Scanning system logs...</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Sidebar Status Cards --- */}
                <div className="space-y-8">
                    {/* Institutional Completion Pulse */}
                    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Institutional Pulse</p>
                            <h3 className="text-lg font-black text-slate-900 mb-6">Quiz Completion</h3>

                            <div className="flex items-center justify-center py-4">
                                <div className="relative w-32 h-32">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent"
                                            strokeDasharray={364.4}
                                            strokeDashoffset={364.4 - (364.4 * stats.completionRate) / 100}
                                            className="text-orange-500 transition-all duration-1000 ease-out"
                                            strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-slate-900">{stats.completionRate}%</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">Quota</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Today</p>
                                    <p className="text-sm font-black text-slate-800">{stats.enrolledToday}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Units</p>
                                    <p className="text-sm font-black text-slate-800">{stats.totalStudents}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Exam Session */}
                    <div className="bg-[#002e5d] p-7 rounded-[2.5rem] shadow-xl shadow-blue-900/10 text-white relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`w-2 h-2 rounded-full ${stats.examStatus === 'Live' ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`}></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Exam Session: {stats.examStatus}</span>
                            </div>
                            <h3 className="text-3xl font-black tracking-tighter mb-1">{countdown || "Calculating..."}</h3>
                            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">Remaining till window shift</p>

                            <hr className="my-6 border-blue-800" />

                            <div className="space-y-4">
                                {services.map((svc) => (
                                    <div key={svc.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{svc.icon}</span>
                                            <span className="text-xs font-bold text-white/90">{svc.name}</span>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-300 bg-blue-900/50 px-2.5 py-1 rounded-full border border-blue-800">
                                            {svc.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Broadcast Control UI --- */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent)] transition-all group-hover:opacity-75"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Mission Control Center</h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                            Authorized access only. Broadcast instant announcements to all students currently taking the quiz. These messages appear in real-time as a scrolling ticker or modal alert.
                        </p>

                        <div className="space-y-4 max-h-60 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-700">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 px-1">Active Broadcasts</p>
                            {activeBroadcasts.length > 0 ? activeBroadcasts.map((b) => (
                                <div key={b._id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex justify-between items-center group/item hover:border-slate-600 transition-all">
                                    <div className="flex gap-3">
                                        <span className="text-lg">
                                            {b.type === 'urgent' ? '🚨' : b.type === 'warning' ? '⚠️' : '📢'}
                                        </span>
                                        <div>
                                            <p className="text-white text-xs font-bold leading-tight">{b.message}</p>
                                            <p className="text-[8px] text-slate-500 font-bold uppercase mt-1 tracking-wider">
                                                Expires: {new Date(b.expiresAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteBroadcast(b._id)} className="opacity-0 group-hover/item:opacity-100 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                        🗑️
                                    </button>
                                </div>
                            )) : (
                                <div className="text-slate-600 text-[10px] font-bold uppercase tracking-widest text-center py-4 italic border border-slate-800 rounded-xl">No active announcements</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-800/40 p-10 rounded-[2rem] border border-slate-700/50 backdrop-blur-md">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Announcement Content</label>
                                <textarea
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    placeholder="Type your alert message here..."
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white text-sm font-bold placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none min-h-[100px]"
                                />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {['info', 'warning', 'urgent'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setBroadcastType(t)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${broadcastType === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                    >
                                        {t} {t === 'urgent' ? '🚨' : t === 'warning' ? '⚠️' : '📢'}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleSendBroadcast}
                                disabled={isBroadcasting || !broadcastMsg.trim()}
                                className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isBroadcasting ? 'Broadcasting...' : 'Launch Worldwide Alert 🛰️'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
