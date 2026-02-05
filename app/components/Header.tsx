"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
                    <div className="px-4 md:px-6 py-[clamp(0.5rem,1.5vh,1rem)] flex flex-col lg:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 shrink-0">
                            {/* Star Logo - Refined Geometry */}
                            <Link href="/" className="relative w-[clamp(3.5rem,7vh,5rem)] h-[clamp(3.5rem,7vh,5rem)] drop-shadow-xl active:scale-95 transition-all block">
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                    <defs>
                                        <path id="circlePathTop" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                                        <mask id="starMask">
                                            <rect width="100" height="100" fill="black" />
                                            <path
                                                d="M50 22 L58 42 L80 42 L62 55 L70 78 L50 64 L30 78 L38 55 L20 42 L42 42 Z"
                                                fill="white"
                                            />
                                        </mask>
                                    </defs>
                                    <circle cx="50" cy="50" r="48" className="fill-[#002e5d]" />

                                    {/* Straight Star */}
                                    <path
                                        d="M50 22 L58 42 L80 42 L62 55 L70 78 L50 64 L30 78 L38 55 L20 42 L42 42 Z"
                                        className="fill-[#e11d48] stroke-white stroke-[2]"
                                    />

                                    {/* Tilted Blue Band - Restricted to Star */}
                                    <rect
                                        x="46" y="0" width="3.5" height="100"
                                        className="fill-[#002e5d]"
                                        mask="url(#starMask)"
                                        transform="rotate(15 50 50)"
                                    />

                                    <text className="text-[9px] font-black fill-white uppercase tracking-[0.2em]">
                                        <textPath xlinkHref="#circlePathTop" startOffset="25%" textAnchor="middle">
                                            eduquiz.world
                                        </textPath>
                                    </text>
                                </svg>
                            </Link>

                            {/* Text Branding & Integrated Live Info */}
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[clamp(1.5rem,4vh,2.5rem)] font-black text-[#e11d48] tracking-tighter italic leading-none whitespace-nowrap">Edu Quiz</span>
                                    <span className="text-[clamp(1.5rem,4vh,2.5rem)] font-black text-[#002e5d] tracking-tighter italic leading-none whitespace-nowrap">world</span>
                                </div>

                                {/* Live Section - Prominent & Beside Text */}
                                <div className="flex items-center gap-3 mt-1 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full w-fit">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest leading-none">LIVE PROGRAM</span>
                                    </div>
                                    <div className="h-2.5 w-[1px] bg-slate-200"></div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">TODAY'S DATE:</span>
                                        <span className="text-[9px] font-extrabold text-[#002e5d] leading-none">{today}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center Branding - Promoted by T-SAT */}
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
