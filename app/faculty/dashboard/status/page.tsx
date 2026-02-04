"use client";

export default function ProgramStatus() {
    const alerts = [
        { type: "Active", msg: "Main Quiz server is operational", time: "Live", color: "text-green-600 bg-green-50" },
        { type: "Upcoming", msg: "Batch 2 Registration starts in 4 hours", time: "Upcoming", color: "text-blue-600 bg-blue-50" },
        { type: "Info", msg: "System maintenance scheduled for Monday, 2 AM", time: "Notice", color: "text-amber-600 bg-amber-50" },
    ];

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
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-lg font-black text-slate-800">100% Online</span>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Students</p>
                        <p className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <span className="text-2xl">🔥</span> 842 Live
                        </p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Bandwidth Usage</p>
                        <div className="w-full bg-slate-200 h-2 rounded-full mt-3">
                            <div className="bg-blue-600 h-full w-[45%] rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Recent Status Logs</h3>
                    {alerts.map((alert, i) => (
                        <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border border-slate-50 ${alert.color}`}>
                            <div className="flex items-center gap-4">
                                <span className="font-black text-xs uppercase px-2 py-1 bg-white/50 rounded-lg">{alert.type}</span>
                                <p className="font-bold text-sm tracking-tight">{alert.msg}</p>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{alert.time}</span>
                        </div>
                    ))}
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
