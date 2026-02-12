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
                        // router.push('/quiz/login'); // Optional: redirect if dashboard fetch fails
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
        <div className="w-full bg-slate-50 p-2 sm:p-4 h-full overflow-hidden flex flex-col">
            <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 space-y-3 sm:space-y-4">
                {/* Header - REFINED PREMIUM */}
                <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-slate-200 shrink-0 transition-all duration-300">
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-4">
                        <div className="w-full lg:w-auto text-center lg:text-left flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-2xl shadow-lg hidden sm:flex">
                                🎓
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">
                                    Welcome back, <span className="text-blue-600">{student.name}!</span> 👋
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5 justify-center lg:justify-start">
                                    <span className="bg-slate-100 text-slate-900 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-slate-200">
                                        LEVEL {student.level}
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        {student.className} • {student.schoolName}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-center w-full lg:w-auto">
                            {data.quizAvailability?.canTakeQuiz ? (
                                <Link href="/quiz/levels">
                                    <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-2">
                                        🚀 Take Daily Quiz
                                    </button>
                                </Link>
                            ) : (
                                <button className="px-5 py-2.5 bg-orange-50 text-orange-700 text-xs font-black rounded-lg cursor-not-allowed border border-orange-100 flex items-center gap-2" disabled>
                                    ⏰ Next Quiz 6 AM
                                </button>
                            )}
                            <Link href="/">
                                <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-lg transition-all flex items-center gap-2">
                                    🏠 Home
                                </button>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-black rounded-lg transition-all border border-red-100 flex items-center gap-2"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch overflow-hidden">
                    {/* Main Content Stack (Left + Center) */}
                    <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
                        {/* Stats Grid - Aligned with Rankers border below */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
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

                        {/* Content Blocks: Activity & Rankers */}
                        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Col 1: Recent Activity */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0 transition-all duration-300">
                                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center shrink-0">
                                    <h2 className="text-[12px] font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                                        📜 Activity
                                    </h2>
                                    <button className="text-[10px] text-blue-600 hover:text-blue-700 font-black uppercase tracking-wider">All</button>
                                </div>
                                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                                    {quizHistory.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mb-3 opacity-50">📑</div>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">No activity yet</p>
                                        </div>
                                    ) : (
                                        <table className="w-full">
                                            <thead className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 shadow-sm shadow-slate-50">
                                                <tr className="border-b border-slate-100">
                                                    <th className="text-left py-3 px-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Date</th>
                                                    <th className="text-left py-3 px-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Score</th>
                                                    <th className="text-left py-3 px-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">%</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {quizHistory.map((quiz: any, i: number) => (
                                                    <tr key={i} className="border-b border-slate-50 hover:bg-indigo-50/20 transition-all duration-300 group">
                                                        <td className="py-3.5 px-5 text-slate-600 text-[11px] font-bold">{quiz.date}</td>
                                                        <td className="py-3.5 px-5 font-black text-slate-800 text-[12px] group-hover:text-indigo-600 transition-colors">{quiz.score}/{quiz.total}</td>
                                                        <td className="py-3 px-5 text-right">
                                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-all duration-300 ${quiz.percentage >= 80 ? 'bg-green-50 text-green-600 border-green-100' :
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

                            {/* Col 2: Top Rankers */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0 transition-all duration-300">
                                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center shrink-0">
                                    <h2 className="text-[12px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        🏆 Rankers
                                    </h2>
                                    <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">TODAY</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-100 hover:scrollbar-thumb-slate-200">
                                    {[
                                        { rank: 1, name: 'Priya S.', score: '25/25', img: '🥇' },
                                        { rank: 2, name: 'Rahul K.', score: '24/25', img: '🥈' },
                                        { rank: 3, name: 'Amit J.', score: '24/25', img: '🥉' },
                                        { rank: 4, name: 'Sneha R.', score: '23/25', img: '👤' },
                                        { rank: 5, name: 'Arjun M.', score: '22/25', img: '👤' },
                                        { rank: 6, name: 'Kavita L.', score: '22/25', img: '👤' },
                                        { rank: 7, name: 'Rohan B.', score: '21/25', img: '👤' },
                                        { rank: 8, name: 'Rohan B.', score: '21/25', img: '👤' },
                                        { rank: 9, name: 'Rohan B.', score: '21/25', img: '👤' },
                                        { rank: 10, name: 'Rohan B.', score: '21/25', img: '👤' },
                                    ].map((user, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-blue-50/40 rounded-xl transition-all duration-300 border border-transparent hover:border-blue-100 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                                    {user.img}
                                                </div>
                                                <span className="text-[13px] font-black text-slate-700 group-hover:text-blue-600 transition-colors">{user.name}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[11px] font-black text-slate-900 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">{user.score}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stack (Right) */}
                    <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
                        {/* Vouchers - PREMIUM CARD STYLE */}
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white/60 overflow-hidden flex flex-col flex-1 min-h-0 transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)] group">
                            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 px-5 py-4 shrink-0 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                                <h2 className="text-[12px] font-[1000] text-white flex items-center justify-between uppercase tracking-[0.2em] relative z-10">
                                    <span className="flex items-center gap-2">🎁 Vouchers</span>
                                    <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-[10px] border border-white/10 font-bold backdrop-blur-sm">{vouchers.length}</span>
                                </h2>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/20 scrollbar-thin">
                                {vouchers.length > 0 ? (
                                    <div className="space-y-3">
                                        {vouchers.map((voucher: any) => (
                                            <div key={voucher._id} className="bg-white rounded-xl p-3 border-2 border-dashed border-slate-100 shadow-sm relative overflow-hidden group/voucher hover:border-blue-200 transition-all duration-300">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600"></div>
                                                <div className="flex justify-between items-center relative z-10">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-slate-800 font-mono tracking-[0.15em] uppercase">{voucher.voucherCode}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 mt-0.5">Vajra Gift Card</span>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 px-3 py-1.5 rounded-lg border border-green-100 font-extrabold text-[12px] shadow-inner">
                                                        {voucher.discountPercent}% OFF
                                                    </div>
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/voucher:animate-shimmer pointer-events-none"></div>
                                            </div>
                                        ))}
                                        <Link href="/student/gifts" className="block group/total">
                                            <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:text-blue-600 hover:border-blue-100 transition-all uppercase tracking-[0.2em] shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                                                Visit Gift Catalog
                                                <svg className="w-4 h-4 group-hover/total:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-6">
                                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">🏷️</div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-4">No Active Vouchers</p>
                                        <Link href="/student/gifts" className="w-full">
                                            <button className="w-full py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-[0.2em] shadow-lg shadow-slate-200 hover:bg-black transition-all hover:-translate-y-1 active:scale-95">Shop Now</button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rewards - CLEAN STYLE */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 transition-all duration-300">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
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
    );
}

function StatCard({ icon, title, value, trend, color, bgColor }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-2 sm:p-2.5 border border-slate-100 hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
            <div className="flex justify-between items-center mb-1.5">
                <div className={`w-7 h-7 ${color} ${bgColor} rounded-lg flex items-center justify-center text-sm shadow-sm transition-transform duration-300`}>
                    {icon}
                </div>
                <span className="text-[7.5px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100 uppercase tracking-tighter">{trend}</span>
            </div>
            <div>
                <div className="text-slate-400 text-[8.5px] font-black uppercase tracking-wider mb-0">{title}</div>
                <div className="text-base font-black text-slate-900 leading-tight tracking-tight">{value}</div>
            </div>
        </div>
    );
}

const RewardCardSmall = ({ title, status, sub }: any) => {
    const isEligible = status === 'Eligible';
    return (
        <div className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${isEligible ? 'bg-gradient-to-r from-green-50 to-white border-green-200' : 'bg-slate-50/50 border-slate-100'}`}>
            <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${isEligible ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    {title.includes('Daily') ? '🎯' : '📅'}
                </div>
                <div>
                    <div className="text-[10px] font-black text-slate-800 tracking-tight leading-none">{title}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{sub}</div>
                </div>
            </div>
            {isEligible ? (
                <span className="text-[9px] font-black text-green-600 bg-white shadow-sm px-2 py-0.5 rounded-full border border-green-100 animate-pulse">✓</span>
            ) : (
                <span className="text-[9px] font-black text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">{status}</span>
            )}
        </div>
    );
};


