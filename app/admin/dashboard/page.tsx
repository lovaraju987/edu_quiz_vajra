export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Overview of your platform's performance</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                        Download Report
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-600/20">
                        + New Quiz
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value="1,284"
                    trend="+12%"
                    icon="🎓"
                    color="bg-blue-500"
                />
                <StatCard
                    title="Faculty Members"
                    value="42"
                    trend="+2"
                    icon="👨‍🏫"
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Quizzes Taken"
                    value="15.4k"
                    trend="+8%"
                    icon="📝"
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Avg. Score"
                    value="76%"
                    trend="+1.2%"
                    icon="📈"
                    color="bg-amber-500"
                />
            </div>

            {/* Quick Actions / Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Registrations</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                                        S{i}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">Student Name {i}</div>
                                        <div className="text-xs text-slate-400">Class 10 • St. Mary's School</div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">System Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Database</span>
                            <span className="text-green-600 font-bold">Connected 🟢</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">AI Service</span>
                            <span className="text-green-600 font-bold">Operational 🟢</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Last Backup</span>
                            <span className="text-slate-900 font-bold">2 hours ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl text-white shadow-lg shadow-blue-900/10`}>
                    {icon}
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {trend}
                </span>
            </div>
            <div>
                <div className="text-slate-400 text-sm font-medium">{title}</div>
                <div className="text-3xl font-black text-slate-900 mt-1">{value}</div>
            </div>
        </div>
    )
}
