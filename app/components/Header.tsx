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
                const res = await fetch('/api/admin/tv');
                const data = await res.json();
                if (data.success && data.data?.headerAds) {
                    setAds(data.data.headerAds);
                }
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

        // TRIPLE PROTECTION: Cookie + LocalStorage
        document.cookie = "suppress_launch_overlay=true; path=/; max-age=30";
        localStorage.setItem("suppress_launch_overlay", "true");

        // Use standard signOut
        await signOut({ callbackUrl: '/' });
    };

    return (
        <div className="w-full bg-white border-b shadow-sm relative z-50">
            <div className="max-w-[1700px] mx-auto">
                <header className="flex flex-col">
                    {/* Main Identity Bar */}
                    <div className="px-2 md:px-6 py-0 flex flex-row lg:flex-row items-center justify-between gap-1 md:gap-4 min-h-[85px] relative">
                        {/* Logo Container */}
                        <div className="flex items-center shrink-0 z-20">
                            <Link href="/" className="flex items-center shrink-0">
                                <img
                                    src="/images/edu-quiz-logo.png"
                                    alt="EduQuiz Logo"
                                    className="h-[40px] md:h-[80px] w-auto object-contain drop-shadow-sm hover:scale-[1.01] transition-transform"
                                />
                            </Link>
                        </div>

                        {/* External Monetized Advertisement Blocks - Desktop only */}
                        <div className="hidden lg:flex flex-row items-center justify-center gap-2 flex-1 px-8 h-full min-h-[85px]">
                            {/* Header Ads Section */}
                            <div className="flex w-full gap-3 h-full items-center justify-center">
                                {(() => {
                                    // Default Education Brand Ads
                                    const defaultAds = [
                                        { title: "Byjus", imageUrl: "/images/ads/byjus_bg.svg", link: "#" },
                                        { title: "Unacademy", imageUrl: "/images/ads/unacademy_bg.svg", link: "#" },
                                        { title: "Khan Academy", imageUrl: "/images/ads/khan_bg.svg", link: "#" },
                                        { title: "Coursera", imageUrl: "/images/ads/coursera_bg.svg", link: "#" }
                                    ];

                                    // FORCE DEFAULTS if no ads are configured
                                    const displayedAds = (ads && ads.length > 0) ? [...ads] : [...defaultAds];

                                    // Ensure we have at least 4 items by padding with defaults if needed
                                    while (displayedAds.length < 4) {
                                        displayedAds.push(defaultAds[displayedAds.length % 4]);
                                    }

                                    return displayedAds.slice(0, 4).map((ad, i) => (
                                        <a
                                            key={i}
                                            href={ad?.link || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="relative flex-1 max-w-[200px] h-[64px] rounded-lg overflow-hidden group p-[2px] transition-transform hover:scale-[1.02]"
                                        >
                                            {/* Gradient Border — CSS-only, GPU-friendly */}
                                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500 via-blue-500 to-green-500 opacity-80" />

                                            {/* Content Container */}
                                            <div className="relative w-full h-full bg-white rounded-md overflow-hidden flex flex-col z-10">
                                                <div className="flex-1 relative w-full h-full">
                                                    <img
                                                        src={ad?.imageUrl || "/images/edu-quiz-logo.png"}
                                                        alt={ad?.title || "Ad"}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "/images/edu-quiz-logo.png";
                                                            (e.target as HTMLImageElement).className = "w-full h-full object-contain p-2";
                                                        }}
                                                    />
                                                    {ad?.title && (
                                                        <div className="absolute bottom-0 left-0 w-full bg-slate-900 text-white text-[10px] uppercase tracking-wider font-bold text-center py-1 truncate px-2 backdrop-blur-sm z-20">
                                                            {ad.title}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </a>
                                    ));
                                })()}
                            </div>
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
                                <Link href="/faculty/login" className="h-7 md:h-8.5 px-2 md:px-4 flex items-center justify-center text-[9px] md:text-[10px] font-black text-white bg-[#002e5d] border-b-2 border-[#001d3d] rounded-lg md:rounded-xl hover:bg-[#003d7a] transition-all shadow-sm uppercase tracking-wider">
                                    School Login
                                </Link>

                                <Link href="/faculty/login?role=teacher" className="h-7 md:h-8.5 px-2 md:px-4 flex items-center justify-center text-[9px] md:text-[10px] font-black text-white bg-[#7209B7] border-b-2 border-[#4a0578] rounded-lg md:rounded-xl hover:bg-[#5a0792] transition-all shadow-sm uppercase tracking-wider">
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
