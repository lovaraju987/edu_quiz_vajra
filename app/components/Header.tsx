"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EduQuizLogo from "./EduQuizLogo";

import { useSession, signOut } from "next-auth/react";

export default function Header() {
    const { data: session, status } = useSession();
    const [today, setToday] = useState("");
    const router = useRouter();
    const [resultState, setResultState] = useState<{ score: string, total: string, level: string } | null>(null);
    const [ads, setAds] = useState<any[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            setResultState(null);
            localStorage.removeItem("show_result_button");
            localStorage.removeItem("last_quiz_score");
            localStorage.removeItem("last_quiz_total");
            localStorage.removeItem("last_quiz_level");
        }
    }, [status]);

    useEffect(() => {
        // Check for result state
        const checkResult = () => {
            const showResult = localStorage.getItem("show_result_button");
            // Only show if session exists AND student flag is set
            if (showResult === "true" && session) {
                setResultState({
                    score: localStorage.getItem("last_quiz_score") || "0",
                    total: localStorage.getItem("last_quiz_total") || "0",
                    level: localStorage.getItem("last_quiz_level") || "1"
                });
            } else {
                setResultState(null);
            }
        };

        checkResult();
        window.addEventListener('storage', checkResult);
        return () => window.removeEventListener('storage', checkResult);
    }, [session, status]);

    useEffect(() => {
        // Prevent Hydration Mismatch for Date
        const dateStr = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }).replace(/\//g, '-');
        setToday(dateStr);

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
    }, []);

    const handleLogout = async () => {
        // Clear all student-related local storage items immediately
        localStorage.removeItem("show_result_button");
        localStorage.removeItem("last_quiz_score");
        localStorage.removeItem("last_quiz_total");
        localStorage.removeItem("last_quiz_level");
        localStorage.removeItem("currentStudent");
        localStorage.removeItem("student_auth_token");

        // Use standard signOut with redirect to home page
        await signOut({ callbackUrl: '/' });
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
                                @keyframes rotate-border {
                                    0% { --angle: 0deg; }
                                    100% { --angle: 360deg; }
                                }
                                @property --angle {
                                    syntax: '<angle>';
                                    initial-value: 0deg;
                                    inherits: false;
                                }
                                .animate-border-rotate {
                                    --angle: 0deg;
                                    background: linear-gradient(var(--angle), #ff0000, #00ff00, #0000ff, #ff0000);
                                    padding: 2px;
                                    animation: rotate-border 2s linear infinite;
                                }
                                .animate-border-rotate::after {
                                    content: '';
                                    position: absolute;
                                    inset: -2px;
                                    background: linear-gradient(var(--angle), #ff0000, #00ff00, #0000ff, #ff0000);
                                    z-index: -1;
                                    filter: blur(10px);
                                    animation: rotate-border 2s linear infinite;
                                }
                            `}</style>
                            {ads.length > 0 ? ads.map((ad: any, i: number) => (
                                <a
                                    key={i}
                                    href={ad.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative h-[75px] flex-1 max-w-[200px] rounded-md overflow-hidden group mx-1.5 transition-transform hover:scale-[1.02]"
                                >
                                    {/* Rotating Glowing Border Container */}
                                    <div className="absolute inset-0 animate-border-rotate rounded-md z-0"></div>

                                    {/* Inner Content Card (Black Background to separate from border) */}
                                    <div className="absolute inset-[2px] bg-slate-900 rounded-[4px] overflow-hidden z-10 flex flex-col justify-end">

                                        {/* Full Background Banner Image */}
                                        <div className="absolute inset-0 z-0">
                                            <img src={ad.image} alt={ad.title} className="w-full h-full object-fill opacity-90 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        {/* Text Content - Dark Bar Overlay */}
                                        <div className="relative z-20 w-full bg-slate-900/90 border-t border-white/10 py-1.5 px-2 backdrop-blur-sm">
                                            <div className="flex flex-col items-center justify-center">
                                                <span className="block text-[9px] xl:text-[11px] text-white font-black uppercase tracking-tighter leading-none truncate drop-shadow-md">
                                                    {ad.title}
                                                </span>
                                                <span className="block text-[7px] xl:text-[8px] text-amber-400 font-bold uppercase tracking-widest mt-0.5 truncate drop-shadow-md">
                                                    {ad.subtitle}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            )) : (
                                [1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-[75px] flex-1 max-w-[200px] bg-slate-50 border border-slate-100 rounded-md animate-pulse mx-1.5"></div>
                                ))
                            )}
                        </div>

                        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center">
                            {session && (
                                <button
                                    onClick={handleLogout}
                                    className="h-9 md:h-11 px-3 md:px-5 flex items-center justify-center text-xs md:text-sm font-black text-white bg-red-600 border-b-2 border-red-800 rounded-lg md:rounded-xl hover:bg-red-700 transition-all shadow-md uppercase tracking-wider"
                                >
                                    Sign Out
                                </button>
                            )}

                            {session && resultState && (
                                <Link
                                    href={`/results?score=${resultState.score}&total=${resultState.total}&level=${resultState.level}`}
                                    className="h-9 md:h-11 px-3 md:px-5 flex items-center justify-center text-xs md:text-sm font-black text-white bg-green-600 border-b-2 border-green-800 rounded-lg md:rounded-xl hover:bg-green-700 transition-all shadow-md uppercase tracking-wider"
                                >
                                    My Result
                                </Link>
                            )}

                            <div className="flex flex-col gap-1">
                                <Link href="/faculty/login" className="h-7 md:h-8.5 px-3 md:px-4 flex items-center justify-center text-[9px] md:text-[10px] font-black text-white bg-[#002e5d] border-b-2 border-[#001d3d] rounded-lg md:rounded-xl hover:bg-[#003d7a] transition-all shadow-sm uppercase tracking-wider">
                                    School Login
                                </Link>

                                <Link href="/faculty/login?role=teacher" className="h-7 md:h-8.5 px-3 md:px-4 flex items-center justify-center text-[9px] md:text-[10px] font-black text-white bg-[#7209B7] border-b-2 border-[#4a0578] rounded-lg md:rounded-xl hover:bg-[#5a0792] transition-all shadow-sm uppercase tracking-wider">
                                    Teacher Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>
            </div >
        </div >
    );
}
