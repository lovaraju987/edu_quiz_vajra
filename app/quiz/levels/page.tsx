"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

function LevelsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const studentLevel = searchParams.get("level") || "1";
    const levelFromUrl = searchParams.get("level");
    const studentId = searchParams.get("id") || "";

    const levels = [
        { id: "1", name: "LEVEL 1", classes: "4th to 6th Class", topics: "Class 4 Standard", icon: "🌱" },
        { id: "2", name: "LEVEL 2", classes: "7th to 8th Class", topics: "Class 7 Standard", icon: "🌿" },
        { id: "3", name: "LEVEL 3", classes: "9th to 10th Class", topics: "Class 9 Standard", icon: "🌳" },
    ];

    const handleLevelSelect = (levelId: string) => {
        // Strict Level Enforcement: Student can only select their designated level
        if (levelId === studentLevel) {
            router.push(`/quiz/attempt?level=${levelId}&id=${studentId}`);
        } else {
            toast.error("Access Denied: This level is not for your class range.");
        }
    };

    // Auto-Redirect if user is trying to hack the URL (e.g. they are L1 but URL says level=3)
    useEffect(() => {
        if (studentLevel && levelFromUrl !== studentLevel) {
            router.replace(`/quiz/levels?level=${studentLevel}&id=${studentId}`);
        }
    }, [studentLevel, levelFromUrl]);

    return (
        <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4 md:px-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 md:mb-12">
                    <button
                        onClick={() => {
                            localStorage.removeItem("currentStudent");
                            router.push("/quiz/login");
                        }}
                        className="order-2 md:order-1 self-start text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        <span>◀</span> Logout Session
                    </button>
                    <div className="order-1 md:order-2 text-center flex-1 w-full">
                        <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4 inline-block">
                            Student: {studentId}
                        </span>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Choose Your Challenge ⚔️</h1>
                        <p className="text-sm text-slate-500 font-medium">Access is granted based on your academic level.</p>
                    </div>
                    <div className="hidden md:block order-3 w-32"></div> {/* Spacer for symmetry */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {levels.map((level) => {
                        const isUnlocked = level.id === studentLevel;
                        return (
                            <div
                                key={level.id}
                                onClick={() => handleLevelSelect(level.id)}
                                className={`relative group p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-2 transition-all duration-300 ${isUnlocked
                                    ? "bg-white border-[#002e5d] shadow-2xl shadow-blue-100 cursor-pointer active:scale-95"
                                    : "bg-slate-100 border-slate-200 opacity-75 grayscale cursor-not-allowed"
                                    }`}
                            >
                                {!isUnlocked && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                                        <div className="bg-slate-800/90 text-white p-4 rounded-2xl shadow-xl flex flex-col items-center">
                                            <span className="text-xl mb-1">🔒</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest">Locked</span>
                                        </div>
                                    </div>
                                )}

                                <div className="text-4xl md:text-5xl mb-6">{level.icon}</div>
                                <h3 className={`text-xl md:text-2xl font-black mb-2 tracking-tight ${isUnlocked ? "text-[#002e5d]" : "text-slate-500"}`}>
                                    {level.name}
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{level.classes}</p>
                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black border ${isUnlocked ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-slate-200 border-slate-300 text-slate-500"
                                        }`}>
                                        Difficulty: {level.topics}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium italic">
                                        Topics: Health, GK, Science, tech, Sports, History
                                    </p>
                                </div>

                                {isUnlocked && (
                                    <div className="mt-6 md:mt-8 flex justify-end">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#e11d48] flex items-center justify-center text-white shadow-lg animate-bounce group-hover:bg-[#002e5d] transition-colors">
                                            <span>▶</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 md:mt-16 bg-amber-50 border-2 border-amber-100 p-6 md:p-8 rounded-[30px] shadow-sm">
                    <h4 className="text-amber-800 font-black text-[10px] md:text-sm uppercase tracking-wider mb-3 md:mb-4">⚠️ Important Rules</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <li className="flex gap-3 items-center text-amber-900/70 text-[10px] md:text-sm font-bold">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-[10px]">1</span>
                            Only ONE attempt in 24 hours.
                        </li>
                        <li className="flex gap-3 items-center text-amber-900/70 text-[10px] md:text-sm font-bold">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-[10px]">2</span>
                            Result will be final once submitted.
                        </li>
                        <li className="flex gap-3 items-center text-amber-900/70 text-[10px] md:text-sm font-bold">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-[10px]">3</span>
                            Timer starts when you click 'START'.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function LevelsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LevelsContent />
        </Suspense>
    );
}
