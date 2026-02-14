"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import { useSession, signOut } from "next-auth/react";

export default function StudentDashboard() {
    const { data: session, status } = useSession();
    const [data, setData] = useState<any>(null);
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/quiz/login');
            return;
        }

        if (status === "loading" || !session) return;

        // @ts-ignore
        const idNo = session.user?.id || session.user?.name; // Fallback or strict ID
        if (!idNo) return;

        // Check if coming from quiz completion
        const params = new URLSearchParams(window.location.search);
        const justCompleted = params.get('completed') === 'true';

        //If just completed quiz, add small delay to ensure DB is updated
        const fetchDelay = justCompleted ? 1000 : 0;

        setTimeout(() => {
            fetch(`/api/student/dashboard?idNo=${idNo}`)
                .then(res => res.json())
                .then(d => {
                    if (d.error) {
                        toast.error(d.error);
                    } else {
                        setData(d);
                        setLoading(false);

                        // Fetch vouchers for this student
                        fetch(`/api/vouchers?studentId=${idNo.toUpperCase()}`)
                            .then(res => res.json())
                            .then(voucherData => {
                                if (voucherData.vouchers) {
                                    setVouchers(voucherData.vouchers.filter((v: any) => v.status === 'active'));
                                }
                            })
                            .catch(err => console.error('Error fetching vouchers:', err));

                        // Show success message if just completed quiz
                        if (justCompleted) {
                            const score = params.get('score');
                            const total = params.get('total');
                            setTimeout(() => {
                                toast.success(`🎉 Quiz Completed! Your Score: ${score}/${total}`);
                                window.history.replaceState({}, '', '/student/dashboard');
                            }, 500);
                        }
                    }
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }, fetchDelay);
    }, [session, status, router]);

    const handleLogout = async () => {
        // Clear local storage items that might be stale
        localStorage.removeItem("currentStudent");
        localStorage.removeItem("student_auth_token");
        localStorage.removeItem("show_result_button");
        localStorage.removeItem("last_quiz_score");
        localStorage.removeItem("last_quiz_total");
        localStorage.removeItem("last_quiz_level");

        await signOut({ callbackUrl: '/' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600 font-bold">Unable to load dashboard</p>
            </div>
        );
    }

    const { student, stats, quizHistory, rewards } = data;

    return (
        <div className="h-screen w-screen bg-slate-50 overflow-hidden flex flex-col font-sans">
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-2 sm:px-4 py-3 sm:py-4">
                <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 space-y-3 sm:space-y-4">
                    {/* Header - REFINED PREMIUM - FIXED */}
                    <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-slate-200 shrink-0 transition-all duration-300">
                        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-4">
                            <div className="w-full lg:w-auto text-center lg:text-left flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-2xl shadow-lg hidden sm:flex">
                                    🎓
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                                        Welcome back, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{student.name.split(' ')[0]}</span> 👋
                                    </h1>
                                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center lg:justify-start gap-2">
                                        Level <span className="text-blue-600">0{student.level}</span> <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {student.studentId}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-4 w-full lg:w-auto justify-center">
                                {data.quizAvailability?.canTakeQuiz ? (
                                    <Link href="/quiz/levels" className="flex-1 lg:flex-none">
                                        <button className="w-full h-11 sm:h-12 px-6 sm:px-8 bg-slate-900 hover:bg-black text-white text-[10px] font-black rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-slate-200 active:scale-95 flex items-center justify-center gap-2">
                                            Start Quiz 🚀
                                        </button>
                                    </Link>
                                ) : data.quizAvailability?.hasAttemptedToday ? (
                                    <button className="flex-1 lg:flex-none h-11 sm:h-12 px-6 sm:px-8 bg-green-50 text-green-700 text-[10px] font-black rounded-xl uppercase tracking-widest border border-green-100 cursor-not-allowed" disabled>
                                        ✅ Done Today
                                    </button>
                                ) : (
                                    <div className="flex-1 lg:flex-none h-11 sm:h-12 px-4 sm:px-6 bg-orange-50 text-orange-700/70 text-[10px] font-black rounded-xl uppercase tracking-widest border border-orange-100 flex items-center justify-center text-center">
                                        ⏰ {data.quizAvailability?.startTime} - {data.quizAvailability?.endTime}
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <Link href="/">
                                        <button className="p-3 sm:px-5 sm:h-12 text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center gap-2">
                                            <span className="hidden sm:inline">Home</span> 🏠
                                        </button>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-3 sm:px-5 sm:h-12 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2"
                                    >
                                        <span className="hidden sm:inline">Logout</span> 🚪
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                            {/* Main Content Stack (Left + Center) */}
                            <div className="lg:col-span-2 flex flex-col gap-4">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                                    <StatCard
                                        icon="📝"
                                        title="Quizzes"
                                        value={stats.totalQuizzes}
                                        trend="+1 this week"
                                        color="text-blue-600"
                                        bgColor="bg-blue-50"
                                    />
                                    <StatCard
                                        icon="📊"
                                        title="Avg Score"
                                        value={`${stats.avgScore}%`}
                                        trend="Top 15%"
                                        color="text-green-600"
                                        bgColor="bg-green-50"
                                    />
                                    <StatCard
                                        icon="🔥"
                                        title="Streak"
                                        value={stats.participationStreak}
                                        trend="Keep it up!"
                                        color="text-orange-600"
                                        bgColor="bg-orange-50"
                                    />
                                    <StatCard
                                        icon="🏆"
                                        title="Yearly"
                                        value={stats.yearlyStreak}
                                        trend="On track"
                                        color="text-purple-600"
                                        bgColor="bg-purple-50"
                                    />
                                </div>

                                {/* Activity & Rankers */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Recent Activity */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[300px] transition-all duration-300">
                                        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center shrink-0">
                                            <h2 className="text-[12px] font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                                                📜 Activity
                                            </h2>
                                            <button className="text-[10px] text-blue-600 hover:text-blue-700 font-black uppercase tracking-wider">All</button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                                            {quizHistory.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mb-3 opacity-50">📑</div>
                                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">No activity yet</p>
                                                </div>
                                            ) : (
                                                <table className="w-full">
                                                    <thead className="sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                                                        <tr className="border-b border-slate-100">
                                                            <th className="text-left py-3 px-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Date</th>
                                                            <th className="text-left py-3 px-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Score</th>
                                                            <th className="text-left py-3 px-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">%</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {quizHistory.map((quiz: any, i: number) => (
                                                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                                                                <td className="py-3.5 px-5 text-slate-600 text-[11px] font-bold">{quiz.date}</td>
                                                                <td className="py-3.5 px-5 font-black text-slate-800 text-[12px] group-hover:text-blue-600">{quiz.score}/{quiz.total}</td>
                                                                <td className="py-3 px-5 text-right">
                                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${quiz.percentage >= 80 ? 'bg-green-50 text-green-600 border-green-100' :
                                                                        quiz.percentage >= 60 ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                                                            'bg-red-50 text-red-600 border-red-100'
                                                                        }`}>
                                                                        {quiz.percentage}%
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>

                                    {/* Top Rankers */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[300px] transition-all duration-300">
                                        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center shrink-0">
                                            <h2 className="text-[12px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                🏆 Rankers
                                            </h2>
                                            <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">TODAY</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-100">
                                            {data?.rankers && data.rankers.length > 0 ? (
                                                data.rankers.map((user: any, idx: number) => {
                                                    const medals = ['🥇', '🥈', '🥉'];
                                                    const img = idx < 3 ? medals[idx] : '👤';
                                                    return (
                                                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 group">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-lg">{img}</div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[13px] font-black text-slate-700 group-hover:text-blue-600 truncate max-w-[100px]">{user.name}</span>
                                                                    <span className="text-[9px] font-mono text-slate-400">{user.time}</span>
                                                                </div>
                                                            </div>
                                                            <span className="text-[11px] font-black text-slate-900 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">{user.score}</span>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                                    <div className="text-2xl mb-2 opacity-50">🏆</div>
                                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No rankings yet</p>
                                                    <p className="text-slate-400 text-[9px] mt-1">Be the first to top the leaderboard!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Stack (Right) */}
                            <div className="flex flex-col gap-4">
                                {/* Vouchers */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all duration-300">
                                    <div className="bg-slate-900 px-5 py-4 shrink-0">
                                        <h2 className="text-[12px] font-black text-white flex items-center justify-between uppercase tracking-widest">
                                            <span>🎁 Vouchers</span>
                                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{vouchers.length}</span>
                                        </h2>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {vouchers.length > 0 ? (
                                            <>
                                                {vouchers.map((voucher: any) => (
                                                    <div key={voucher._id} className="bg-white rounded-xl p-3 border-2 border-dashed border-slate-100 relative overflow-hidden group/voucher hover:border-blue-200 transition-all">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                                                        <div className="flex justify-between items-center relative z-10">
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] font-black text-slate-800 font-mono tracking-widest">{voucher.voucherCode}</span>
                                                                <span className="text-[9px] font-bold text-slate-400 mt-0.5">Vajra Gift Card</span>
                                                            </div>
                                                            <div className="bg-green-50 text-green-600 px-2 py-1 rounded-lg font-black text-[12px]">
                                                                {voucher.discountPercent}% OFF
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <Link href="/student/gifts">
                                                    <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:text-blue-600 hover:border-blue-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                                                        Visit Catalog ➡
                                                    </button>
                                                </Link>
                                            </>
                                        ) : (
                                            <div className="text-center py-6">
                                                <div className="text-3xl mb-2">🏷️</div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">No Active Vouchers</p>
                                                <Link href="/student/gifts" className="w-full">
                                                    <button className="w-full py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg hover:bg-black transition-all">Shop Now</button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rewards */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 transition-all duration-300">
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                        Rewards
                                    </h2>
                                    <div className="space-y-3">
                                        <RewardCardSmall title="Daily Goal" status={rewards.daily ? 'Eligible' : 'Locked'} sub="Participate today" />
                                        <RewardCardSmall title="Monthly" status={rewards.monthly ? 'Eligible' : `${stats.participationStreak}/30`} sub="30 Day Streak" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, trend, color, bgColor }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-center mb-2">
                <div className={`w-8 h-8 ${color} ${bgColor} rounded-lg flex items-center justify-center text-lg shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    {icon}
                </div>
                <span className="text-[8px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-tighter">{trend}</span>
            </div>
            <div>
                <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-0.5">{title}</div>
                <div className="text-xl font-black text-slate-900 leading-none">{value}</div>
            </div>
        </div>
    );
}

const RewardCardSmall = ({ title, status, sub }: any) => {
    const isEligible = status === 'Eligible';
    return (
        <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isEligible ? 'bg-green-50/50 border-green-100' : 'bg-slate-50/50 border-slate-100'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${isEligible ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    {title.includes('Daily') ? '🎯' : '📅'}
                </div>
                <div>
                    <div className="text-[11px] font-black text-slate-800 tracking-tight leading-none">{title}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{sub}</div>
                </div>
            </div>
            <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${isEligible ? 'bg-white text-green-600 border-green-100 shadow-sm' : 'bg-white text-slate-400 border-slate-100 shadow-sm'}`}>
                {status}
            </span>
        </div>
    );
}
