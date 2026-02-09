"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function StudentDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const session = localStorage.getItem('studentSession');
        if (!session) {
            router.push('/student/login');
            return;
        }

        const { idNo } = JSON.parse(session);

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
                        router.push('/quiz/login');
                    } else {
                        setData(d);
                        setLoading(false);

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
    }, [router]);

    const handleLogout = () => {
        // Clear ALL student-related localStorage items
        localStorage.removeItem('studentSession');
        localStorage.removeItem('currentStudent');
        localStorage.removeItem('student_auth_token');
        localStorage.removeItem('show_result_button');
        localStorage.removeItem('last_quiz_score');
        localStorage.removeItem('last_quiz_total');
        localStorage.removeItem('last_quiz_level');

        router.push('/');
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-3 px-3">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-xl p-4 mb-3 border-b-4 border-blue-500">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-3">
                        <div className="w-full lg:w-auto">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                                Welcome Back, {student.name}! 👋
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                {student.className} • {student.schoolName} • Level {student.level}
                            </p>
                        </div>
                        <div className="flex gap-2 flex-wrap w-full lg:w-auto">
                            {data.quizAvailability?.canTakeQuiz ? (
                                <Link href="/quiz/levels" className="flex-1 sm:flex-none">
                                    <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-lg">
                                        🚀 Take Daily Quiz
                                    </button>
                                </Link>
                            ) : (
                                <button className="flex-1 sm:flex-none w-full sm:w-auto px-4 py-2 bg-orange-100 text-orange-700 text-sm font-bold rounded-lg cursor-not-allowed opacity-75" disabled>
                                    ⏰ Next Quiz Tomorrow 8 AM
                                </button>
                            )}
                            <Link href="/" className="flex-1 sm:flex-none">
                                <button className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-all">
                                    🏠 Home
                                </button>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex-1 sm:flex-none w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-all"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <StatCard
                        icon="📝"
                        title="Total Quizzes"
                        value={stats.totalQuizzes}
                        subtitle="Completed"
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon="📊"
                        title="Average Score"
                        value={`${stats.avgScore}%`}
                        subtitle="Overall Performance"
                        color="bg-green-500"
                    />
                    <StatCard
                        icon="🔥"
                        title="30-Day Streak"
                        value={stats.participationStreak}
                        subtitle={`days / 30 needed`}
                        color="bg-orange-500"
                    />
                    <StatCard
                        icon="🏆"
                        title="365-Day Streak"
                        value={stats.yearlyStreak}
                        subtitle={`days / 365 needed`}
                        color="bg-purple-500"
                    />
                </div>

                {/* Rewards Eligibility */}
                <div className="bg-white rounded-xl shadow-xl p-4 mb-3">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 mb-3">🎁 Rewards Eligibility</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <RewardCard
                            title="Daily Gifts"
                            description="40-50% vouchers on gadgets"
                            eligible={rewards.daily}
                            requirement="Participate daily"
                        />
                        <RewardCard
                            title="Monthly Gifts"
                            description="Felicitation at college"
                            eligible={rewards.monthly}
                            requirement={`${stats.participationStreak}/30 days`}
                        />
                        <RewardCard
                            title="Scholarship"
                            description="₹1 Lakh for Top 100"
                            eligible={rewards.yearly}
                            requirement={`${stats.yearlyStreak}/365 days`}
                        />
                    </div>
                </div>

                {/* Quiz History */}
                <div className="bg-white rounded-xl shadow-xl p-4">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 mb-3">📜 Recent Quiz History</h2>
                    {quizHistory.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-400 text-sm mb-3">No quizzes taken yet</p>
                            <Link href="/">
                                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all">
                                    Take Your First Quiz 🚀
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-slate-200">
                                            <th className="text-left py-2 px-2 font-black text-slate-700 uppercase text-xs">Date</th>
                                            <th className="text-left py-2 px-2 font-black text-slate-700 uppercase text-xs">Level</th>
                                            <th className="text-left py-2 px-2 font-black text-slate-700 uppercase text-xs">Score</th>
                                            <th className="text-left py-2 px-2 font-black text-slate-700 uppercase text-xs">%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quizHistory.map((quiz: any, i: number) => (
                                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="py-2 px-2 font-bold text-slate-600 text-xs">{quiz.date}</td>
                                                <td className="py-2 px-2">
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold whitespace-nowrap">
                                                        Lvl {quiz.level}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2 font-bold text-slate-900 text-xs">{quiz.score}/{quiz.total}</td>
                                                <td className="py-2 px-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-black whitespace-nowrap ${quiz.percentage >= 80 ? 'bg-green-100 text-green-700' :
                                                        quiz.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {quiz.percentage}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, subtitle, color }: any) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-3 border-b-4 border-slate-200 hover:border-blue-500 transition-all hover:-translate-y-1">
            <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center text-xl mb-2 shadow-xl`}>
                {icon}
            </div>
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">{title}</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mb-0.5">{value}</div>
            <div className="text-slate-400 text-[10px] font-medium">{subtitle}</div>
        </div>
    );
}

function RewardCard({ title, description, eligible, requirement }: any) {
    return (
        <div className={`p-3 rounded-lg border-2 ${eligible ? 'bg-green-50 border-green-500' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-start justify-between mb-1.5">
                <h3 className="text-sm font-black text-slate-900">{title}</h3>
                {eligible ? (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-black rounded-full whitespace-nowrap">✓ ELIGIBLE</span>
                ) : (
                    <span className="px-2 py-0.5 bg-slate-300 text-slate-600 text-[10px] font-black rounded-full whitespace-nowrap">LOCKED</span>
                )}
            </div>
            <p className="text-slate-600 font-medium text-xs mb-1.5">{description}</p>
            <p className="text-[10px] text-slate-400 font-bold">{requirement}</p>
        </div>
    );
}


