"use client";

import { useState, useEffect } from "react";

export default function TopResults() {
    const [topStudents, setTopStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const session = localStorage.getItem("faculty_session");
                const faculty = session ? JSON.parse(session) : null;
                const facultyQuery = faculty ? `?facultyId=${faculty.id}` : "";

                // Fetch filtered results for this school
                const res = await fetch(`/api/quiz/submit${facultyQuery}`);
                let data = await res.json();

                if (Array.isArray(data)) {
                    // Sort by score (desc) and date 
                    data.sort((a: any, b: any) => b.score - a.score);
                    // Add Rank
                    data = data.map((item: any, index: number) => ({
                        ...item,
                        rank: index + 1,
                        prize: index < 3 ? "Gadget + Voucher" : "Voucher",
                        name: item.name || "Student " + item.idNo
                    }));
                    setTopStudents(data.slice(0, 100));
                }
            } catch (error) {
                console.error("Error fetching results", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" /></svg>
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl font-black mb-4 tracking-tight">Today's Hall of Fame</h2>
                    <p className="text-blue-200 text-lg leading-relaxed mb-8">
                        These are the top 100 students selected for rewards based on today's quiz performance. Results update every day at 8:30 PM.
                    </p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                            <span className="text-yellow-400">📅</span>
                            <span className="text-sm font-bold">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                            <span className="text-yellow-400">🎯</span>
                            <span className="text-sm font-bold">Session #482</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Top 100 Rankers</h3>
                        <p className="text-slate-500 text-sm mt-1">Filtered by highest score and fastest completion time.</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors">
                        Download PDF Report
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Rank</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Score</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Time</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Estimated Prize</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {topStudents.map((student) => (
                                <tr key={student.rank} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <span className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm ${student.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                            student.rank === 2 ? 'bg-slate-200 text-slate-800' :
                                                student.rank === 3 ? 'bg-orange-100 text-orange-800' :
                                                    'bg-slate-50 text-slate-500'
                                            }`}>
                                            {student.rank}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-slate-800">{student.name}</div>
                                        <div className="text-xs text-slate-500 font-medium">{student.school}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-blue-700">{student.score}/25</span>
                                            {student.score === 25 && <span className="text-lg">🔥</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-slate-600 font-bold text-sm">
                                        {student.idNo}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${student.rank <= 3 ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {student.prize}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
