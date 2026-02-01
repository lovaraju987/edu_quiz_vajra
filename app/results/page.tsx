"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ResultsContent() {
    const searchParams = useSearchParams();
    const score = searchParams.get("score");
    const total = searchParams.get("total");
    const error = searchParams.get("error");
    const level = searchParams.get("level");

    if (error === "already_attempted") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-12 border border-slate-100 text-center">
                    <div className="text-6xl mb-6">🚫</div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4">Access Denied</h1>
                    <p className="text-slate-500 font-bold mb-8 italic">
                        You have already attempted the quiz for today. Every student gets exactly ONE attempt every 24 hours.
                    </p>
                    <Link href="/" className="inline-block px-10 py-4 bg-[#002e5d] text-white font-black rounded-2xl shadow-lg hover:bg-[#003d7a] transition-all uppercase tracking-widest text-xs">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans">
            <div className="max-w-2xl w-full bg-white rounded-[30px] md:rounded-[50px] shadow-2xl p-6 md:p-12 border border-slate-100 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-[#002e5d]"></div>

                <div className="text-5xl md:text-7xl mb-6 md:mb-8 animate-bounce">🎊</div>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Quiz Completed!</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-8 md:mb-10">Academic Excellence Achievement</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
                    <div className="bg-slate-50 p-6 md:p-8 rounded-[25px] md:rounded-[35px] border border-slate-100 italic">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Score</p>
                        <p className="text-3xl md:text-5xl font-black text-[#e11d48]">{score} / {total}</p>
                    </div>
                    <div className="bg-[#002e5d] p-6 md:p-8 rounded-[25px] md:rounded-[35px] text-white italic">
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Difficulty</p>
                        <p className="text-2xl md:text-4xl font-black">LEVEL {level}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm md:text-base text-slate-500 font-bold italic mb-8 px-2 md:px-0">
                        "Great job! Your performance has been logged and sent to your faculty. Keep participating daily for scholarship Eligibility."
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/" className="px-10 py-4 bg-[#002e5d] text-white font-black rounded-2xl shadow-lg hover:bg-[#003d7a] transition-all uppercase tracking-widest text-[10px] md:text-xs">
                            Finish & Exit
                        </Link>
                        <Link href="/winners" className="px-10 py-4 bg-white text-[#002e5d] border-2 border-[#002e5d] font-black rounded-2xl shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px] md:text-xs">
                            View Leaderboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div>Loading Results...</div>}>
            <ResultsContent />
        </Suspense>
    );
}
