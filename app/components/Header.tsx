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
                    <div className="px-4 md:px-6 py-[clamp(0.5rem,1.5vh,1rem)] flex flex-col lg:flex-row items-center justify-between gap-3 md:gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 shrink-0 w-full lg:w-auto">
                            {/* New Official SVG Logo Branding */}
                            <Link href="/" className="flex items-center gap-3 shrink-0 py-2">
                                <div className="h-[clamp(3.5rem,10vh,6rem)] w-auto aspect-[4/3]">
                                    <EduQuizLogo />
                                </div>
                            </Link>

                            {/* Live Section - Prominent & Beside Text */}
                            <div className="flex flex-col items-start mt-1">
                                <style jsx>{`
                                    @keyframes shimmer {
                                        0% { background-position: -200% center; }
                                        100% { background-position: 200% center; }
                                    }
                                    .animate-shimmer {
                                        background: linear-gradient(
                                            90deg, 
                                            #880022 0%, 
                                            #E11D48 25%, 
                                            #FFCC00 50%, 
                                            #E11D48 75%, 
                                            #880022 100%
                                        );
                                        background-size: 200% auto;
                                        animation: shimmer 4s linear infinite;
                                        -webkit-background-clip: text;
                                        -webkit-text-fill-color: transparent;
                                    }
                                `}</style>
                                <div className="flex items-center gap-2 ml-1 mb-1">
                                    <span className="text-[24px] md:text-[36px] font-black tracking-tighter leading-none animate-shimmer drop-shadow-sm">
                                        EduQuiz.world
                                    </span>
                                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#FFCC00] animate-ping shadow-[0_0_12px_rgba(255,204,0,0.8)]"></div>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 px-2.5 md:px-3 py-0.5 md:py-1.5 bg-slate-50 border border-slate-100 rounded-full w-fit shadow-sm">
                                    <div className="flex items-center gap-1.5 md:gap-2">
                                        <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                        <span className="text-[9px] md:text-[11px] font-black text-slate-800 uppercase tracking-wider md:tracking-widest leading-none">LIVE PROGRAM</span>
                                    </div>
                                    <div className="h-3 md:h-4 w-[1px] bg-slate-200"></div>
                                    <div className="flex items-center gap-0.5 md:gap-1.5">
                                        <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-tighter">TODAY'S DATE:</span>
                                        <span className="text-[10px] md:text-[12px] font-black text-[#002e5d] leading-none">{today}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center Branding - Promoted by T-SAT */}
                        <div className="flex flex-row items-center justify-center gap-3 w-full lg:w-auto lg:absolute lg:left-1/2 lg:top-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2 py-2 lg:py-0">
                            <span className="text-[11px] lg:text-[13px] font-black text-[#002e5d] uppercase tracking-widest leading-none pt-1">Promoted by</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/images/t-sat-logo.png"
                                alt="T-SAT Logo"
                                className="h-[clamp(2rem,6vh,4rem)] w-auto object-contain drop-shadow-md hover:scale-105 transition-transform"
                            />
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
            </div>
        </div>
    );
}
