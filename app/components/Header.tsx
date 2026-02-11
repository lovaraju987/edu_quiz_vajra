"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EduQuizLogo from "./EduQuizLogo";

export default function Header() {
    const [today, setToday] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const [resultState, setResultState] = useState<{ score: string, total: string, level: string } | null>(null);
    const [ads, setAds] = useState<any[]>([]);

    useEffect(() => {
        // Prevent Hydration Mismatch for Date
        const dateStr = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }).replace(/\//g, '-');
        setToday(dateStr);

        // Check for student session and result state
        const checkSession = () => {
            const student = localStorage.getItem("currentStudent");
            setIsLoggedIn(!!student);

            const showResult = localStorage.getItem("show_result_button");
            if (showResult === "true") {
                setResultState({
                    score: localStorage.getItem("last_quiz_score") || "0",
                    total: localStorage.getItem("last_quiz_total") || "0",
                    level: localStorage.getItem("last_quiz_level") || "1"
                });
            } else {
                setResultState(null);
            }
        };

        checkSession();

        // Fetch External Ads for monetization
        const fetchAds = async () => {
            try {
                const res = await fetch('/api/ads');
                const data = await res.json();
                setAds(data);
            } catch (error) {
                console.error("Failed to load ads:", error);
            }
        };
        fetchAds();

        window.addEventListener('storage', checkSession);
        return () => window.removeEventListener('storage', checkSession);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("currentStudent");
        localStorage.removeItem("student_auth_token");
        localStorage.removeItem("show_result_button");
        localStorage.removeItem("last_quiz_score");
        localStorage.removeItem("last_quiz_total");
        localStorage.removeItem("last_quiz_level");

        setIsLoggedIn(false);
        setResultState(null);
        toast.info("Signed out successfully");
        router.replace("/");
    };

    return (
        <div className="w-full bg-white border-b shadow-sm relative z-50">
            <div className="max-w-[1700px] mx-auto">
                <header className="flex flex-col">
                    {/* Main Identity Bar */}
                    <div className="px-4 md:px-6 py-0 flex flex-col lg:flex-row items-center justify-between gap-4 min-h-[85px] relative">
                        {/* Logo Container */}
                        <div className="flex items-center shrink-0 z-20">
                            <Link href="/" className="flex items-center shrink-0">
                                <img
                                    src="/images/edu-quiz-logo.png"
                                    alt="EduQuiz Logo"
                                    className="h-[60px] md:h-[80px] w-auto object-contain drop-shadow-sm hover:scale-[1.01] transition-transform"
                                />
                            </Link>
                        </div>

                        {/* External Monetized Advertisement Blocks - Animated Border Fitted */}
                        <div className="hidden lg:flex flex-row items-center justify-center gap-2 flex-1 px-8 h-full min-h-[85px]">
                            <style jsx>{`
                                @keyframes border-glow {
                                    0%, 100% { border-color: rgba(148, 163, 184, 0.1); box-shadow: 0 0 5px rgba(0,0,0,0.02); }
                                    50% { border-color: #3b82f6; box-shadow: 0 0 15px rgba(59, 130, 246, 0.2); }
                                }
                                .animate-border-glow {
                                    animation: border-glow 3s ease-in-out infinite;
                                }
                                @keyframes shimmer-slide {
                                    0% { transform: translateX(-100%); }
                                    100% { transform: translateX(100%); }
                                }
                                .shimmer-line {
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    width: 100%;
                                    height: 2px;
                                    background: linear-gradient(90deg, transparent, #3b82f6, transparent);
                                    animation: shimmer-slide 2s linear infinite;
                                }
                                .shimmer-line-bottom {
                                    position: absolute;
                                    bottom: 0;
                                    right: 0;
                                    width: 100%;
                                    height: 2px;
                                    background: linear-gradient(90deg, transparent, #3b82f6, transparent);
                                    animation: shimmer-slide 2s linear infinite reverse;
                                }
                            `}</style>
                            {ads.length > 0 ? ads.map((ad: any, i: number) => (
                                <a
                                    key={i}
                                    href={ad.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`h-[75px] flex-1 max-w-[200px] ${ad.color} border border-slate-100 rounded-md flex flex-col items-center justify-center transition-all hover:brightness-95 cursor-pointer group relative overflow-hidden animate-border-glow mx-1.5`}
                                >
                                    {/* Animated Border Shimmer Lines */}
                                    <div className="shimmer-line"></div>
                                    <div className="shimmer-line-bottom"></div>

                                    <span className={`text-[9px] xl:text-[11px] ${ad.text} font-black uppercase tracking-tighter leading-none relative z-10`}>
                                        {ad.title}
                                    </span>
                                    <span className="text-[8px] xl:text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 relative z-10">
                                        {ad.subtitle}
                                    </span>
                                </a>
                            )) : (
                                [1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-[75px] flex-1 max-w-[200px] bg-slate-50 border border-slate-100 rounded-md animate-pulse mx-1.5"></div>
                                ))
                            )}
                        </div>

                        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center">
                            {isLoggedIn && (
                                <button
                                    onClick={handleLogout}
                                    className="h-9 md:h-11 px-3 md:px-5 flex items-center justify-center text-xs md:text-sm font-black text-white bg-red-600 border-b-2 border-red-800 rounded-lg md:rounded-xl hover:bg-red-700 transition-all shadow-md uppercase tracking-wider"
                                >
                                    Sign Out
                                </button>
                            )}

                            {resultState && (
                                <Link
                                    href={`/results?score=${resultState.score}&total=${resultState.total}&level=${resultState.level}`}
                                    className="h-9 md:h-11 px-3 md:px-5 flex items-center justify-center text-xs md:text-sm font-black text-white bg-green-600 border-b-2 border-green-800 rounded-lg md:rounded-xl hover:bg-green-700 transition-all shadow-md uppercase tracking-wider"
                                >
                                    My Result
                                </Link>
                            )}

                            <Link href="/faculty/login" className="h-9 md:h-11 px-3 md:px-5 flex items-center justify-center text-xs md:text-sm font-black text-white bg-[#002e5d] border-b-2 border-[#001d3d] rounded-lg md:rounded-xl hover:bg-[#003d7a] transition-all shadow-md uppercase tracking-wider">
                                Faculty Login
                            </Link>
                        </div>
                    </div>
                </header>
            </div >
        </div >
    );
}
