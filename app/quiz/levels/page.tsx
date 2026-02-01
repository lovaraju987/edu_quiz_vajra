import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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
            alert("Access Denied: This level is not for your class range.");
        }
    };

    // Auto-Redirect if user is trying to hack the URL (e.g. they are L1 but URL says level=3)
    useEffect(() => {
        if (studentLevel && levelFromUrl !== studentLevel) {
            router.replace(`/quiz/levels?level=${studentLevel}&id=${studentId}`);
        }
    }, [studentLevel, levelFromUrl]);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-start mb-12">
                    <button
                        onClick={() => {
                            localStorage.removeItem("currentStudent");
                            router.push("/quiz/login");
                        }}
                        className="text-xs font-black text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        <span>◀</span> Logout Session
                    </button>
                    <div className="text-center flex-1 pr-24">
                        <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4 inline-block">
                            Student: {studentId}
                        </span>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Choose Your Challenge ⚔️</h1>
                        <p className="text-slate-500 font-medium">Access is granted based on your registered academic level.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {levels.map((level) => {
                        const isUnlocked = level.id === studentLevel;
                        return (
                            <div
                                key={level.id}
                                onClick={() => handleLevelSelect(level.id)}
                                className={`relative group p-8 rounded-[40px] border-2 transition-all duration-300 ${isUnlocked
                                    ? "bg-white border-[#002e5d] shadow-2xl shadow-blue-100 cursor-pointer active:scale-95"
                                    : "bg-slate-100 border-slate-200 opacity-75 grayscale cursor-not-allowed"
                                    }`}
                            >
                                {!isUnlocked && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                                        <div className="bg-slate-800/90 text-white p-4 rounded-2xl shadow-xl flex flex-col items-center">
                                            <span className="text-2xl mb-1">🔒</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Locked</span>
                                        </div>
                                    </div>
                                )}

                                <div className="text-5xl mb-6">{level.icon}</div>
                                <h3 className={`text-2xl font-black mb-2 tracking-tight ${isUnlocked ? "text-[#002e5d]" : "text-slate-500"}`}>
                                    {level.name}
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{level.classes}</p>
                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black border ${isUnlocked ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-slate-200 border-slate-300 text-slate-500"
                                        }`}>
                                        Difficulty: {level.topics}
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium italic">
                                        Topics: Health, GK, Science, tech, Sports, History, Current Affairs
                                    </p>
                                </div>

                                {isUnlocked && (
                                    <div className="mt-8 flex justify-end">
                                        <div className="w-12 h-12 rounded-full bg-[#e11d48] flex items-center justify-center text-white shadow-lg animate-bounce group-hover:bg-[#002e5d] transition-colors">
                                            <span>▶</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 bg-amber-50 border-2 border-amber-100 p-8 rounded-[30px] shadow-sm">
                    <h4 className="text-amber-800 font-black text-sm uppercase tracking-wider mb-3">⚠️ Important Rules</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <li className="flex gap-3 items-center text-amber-900/70 text-sm font-bold">
                            <span className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-[10px]">1</span>
                            Only ONE attempt in 24 hours.
                        </li>
                        <li className="flex gap-3 items-center text-amber-900/70 text-sm font-bold">
                            <span className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-[10px]">2</span>
                            Result will be final once submitted.
                        </li>
                        <li className="flex gap-3 items-center text-amber-900/70 text-sm font-bold">
                            <span className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-[10px]">3</span>
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
