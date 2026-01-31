"use client";

export default function DashboardOverview() {
    const stats = [
        { name: "Total Students", value: "1,248", icon: "👥", change: "+12%", color: "text-blue-600 bg-blue-50" },
        { name: "Enrolled Today", value: "45", icon: "📝", change: "+5%", color: "text-green-600 bg-green-50" },
        { name: "Quiz Completion", value: "88%", icon: "✅", change: "+2%", color: "text-purple-600 bg-purple-50" },
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
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">#</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">New Student Registered at Government School, Area B</p>
                                    <p className="text-xs text-slate-500 mt-1">2 minutes ago • ID: EQ-500{i}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-xl border border-blue-800 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <div className="text-9xl font-black rotate-12">8:30</div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Daily Live Quiz Pulse</h3>
                    <p className="text-blue-200 text-sm mb-8">The next session starts in 2 hours and 15 mins.</p>

                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-blue-300">Live Participants</span>
                            <span className="font-bold">842</span>
                        </div>
                        <div className="w-full h-2 bg-blue-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 w-[70%]" />
                        </div>
                        <p className="text-xs text-blue-300 italic">Target capacity: 1,200 students per session</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
