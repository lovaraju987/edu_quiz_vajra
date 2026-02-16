"use client";
import { useState, useEffect } from "react";

export default function ProgramStatus() {
    const [stats, setStats] = useState({
        serverHealth: "Checking...",
        activeLive: 0,
        bandwidthPercent: 0,
        logs: [] as any[]
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/faculty/stats');
                const data = await res.json();
                if (!data.error) {
                    setStats({
                        serverHealth: data.serverHealth,
                        activeLive: data.activeLive,
                        bandwidthPercent: data.bandwidthPercent,
                        logs: data.logs
                    });
                }
            } catch (error) {
                console.error("Failed to fetch status:", error);
            }
        };

        fetchStats();
        // Refresh every 30 seconds for live feel
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span>⚡</span> System & Program Status
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Server Health</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${stats.serverHealth.includes("Online") ? "bg-green-500 animate-pulse" : "bg-red-500"} `}></div>
                            <span className="text-lg font-black text-slate-800">{stats.serverHealth}</span>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Students</p>
                        <p className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <span className="text-2xl">🔥</span> {stats.activeLive} Live
                        </p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Bandwidth Usage</p>
                        <div className="w-full bg-slate-200 h-2 rounded-full mt-3">
                            <div
                                className="bg-blue-600 h-full rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all duration-1000"
                                style={{ width: `${stats.bandwidthPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Recent Status Logs</h3>
                    {stats.logs && stats.logs.length > 0 ? (
                        stats.logs.map((alert: any, i: number) => (
                            <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border border-slate-50 ${alert.color || "bg-slate-50 text-slate-500"}`}>
                                <div className="flex items-center gap-4">
                                    <span className="font-black text-xs uppercase px-2 py-1 bg-white/50 rounded-lg">{alert.type}</span>
                                    <p className="font-bold text-sm tracking-tight">{alert.msg}</p>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{alert.time}</span>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-slate-400 text-xs italic">Loading system logs...</div>
                    )}
                </div>
            </div>

            <div className="bg-[#002e5d] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <div className="text-9xl font-black rotate-12">LIVE</div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2 tracking-tight">Broadcast Control Portal</h3>
                    <p className="text-blue-200 text-sm mb-6 font-medium">Manage final announcements and live scroll text for all participants.</p>
                    <button className="px-8 py-3 bg-white text-[#002e5d] font-black rounded-xl hover:bg-slate-100 transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs">
                        Open Control Panel
                    </button>
                </div>
            </div>
        </div>
    );
}
