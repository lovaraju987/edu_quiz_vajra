"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn, useSession, getSession } from "next-auth/react";
import { validateStudentId } from "@/lib/utils/validation";

export default function StudentLogin() {
    const [studentId, setStudentId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        localStorage.removeItem("show_result_button");
        localStorage.removeItem("last_quiz_score");
        localStorage.removeItem("last_quiz_total");
        localStorage.removeItem("last_quiz_level");

        if (status === "authenticated") {
            if (session?.user?.isDefaultPassword) {
                router.replace("/student/update-password");
            } else {
                router.replace("/student/dashboard");
            }
        }
    }, [status, session, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanStudentId = studentId.trim().toUpperCase();
        const cleanPassword = password.trim();

        if (!cleanStudentId) { toast.error("Please enter your Student ID"); return; }
        if (!validateStudentId(cleanStudentId)) { toast.error("Invalid Student ID format"); return; }
        if (!cleanPassword) { toast.error("Please enter your Password"); return; }

        try {
            const result = await signIn("credentials", {
                studentId: cleanStudentId,
                password: cleanPassword,
                redirect: false
            });
            if (result?.error) { toast.error(result.error); return; }
            await new Promise(resolve => setTimeout(resolve, 500));
            const updatedSession = await getSession();
            // @ts-ignore
            if (updatedSession?.user?.isDefaultPassword) { window.location.href = "/student/update-password"; }
            else { toast.success("Login successful!"); window.location.href = "/student/dashboard"; }
        } catch (error) { toast.error("Error connecting to server."); }
    };

    return (
        <div className="h-[100dvh] w-full bg-[#f8fafc] flex items-center justify-center p-0 font-sans relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-[35vh] bg-blue-600"></div>
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
            </div>

            {/* Gapless Command Dashboard - 100% Screen Height Utilization */}
            <div className="relative z-10 w-full h-full flex flex-col bg-white shadow-2xl overflow-hidden">

                {/* 1. Header (Ultra-Tight) */}
                <header className="flex items-center justify-between px-6 py-2 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg font-black">🎓</div>
                        <span className="text-xl font-black text-slate-900 tracking-tighter">Edu<span className="text-blue-600">Quiz</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Vajra Intelligence Network Active</span>
                    </div>
                </header>

                {/* 2. Main High-Density Board */}
                <div className="flex-1 flex flex-col lg:flex-row min-h-0">

                    {/* Left Panel: Rewards Hub (Edge-to-Edge) */}
                    <aside className="lg:w-[320px] 2xl:w-[380px] border-r border-slate-100 flex flex-col bg-slate-50/30 overflow-hidden">
                        <div className="flex-1 flex flex-col">
                            {/* Daily Participants Section */}
                            <div className="p-4 border-b border-slate-100 bg-white shadow-sm">
                                <h4 className="text-[13px] font-black text-orange-600 uppercase tracking-widest mb-3">👉 DAILY PARTICIPANTS</h4>
                                <div className="space-y-2.5">
                                    <div className="flex items-start gap-2 bg-orange-50/30 p-2.5 rounded-xl border border-orange-100">
                                        <span className="text-blue-600 text-sm font-bold mt-0.5">•</span>
                                        <p className="text-[15px] font-black text-slate-900 leading-tight">Daily Gifts For Top 100 Nos.</p>
                                    </div>
                                    <div className="flex items-start gap-2 bg-orange-50/30 p-2.5 rounded-xl border border-orange-100">
                                        <span className="text-blue-600 text-sm font-bold mt-0.5">•</span>
                                        <p className="text-[15px] font-black text-slate-900 leading-tight">Gift Vouchers For One Lakh Nos.</p>
                                    </div>
                                    <p className="text-[11px] font-black text-orange-400 italic mt-1">(Participants Encouragement Gifts)</p>
                                </div>
                            </div>

                            {/* Monthly Special Section (Fills remaining space) */}
                            <div className="flex-1 p-4 bg-white/50 space-y-3">
                                <h4 className="text-[13px] font-black text-indigo-600 uppercase tracking-widest mb-2">👉 MONTHLY SPECIAL</h4>
                                <div className="bg-indigo-600 text-white p-5 rounded-3xl shadow-lg border border-indigo-700">
                                    <p className="text-[16px] font-black leading-tight mb-3">Every Month End 30th Day Open Quiz At College</p>
                                    <div className="h-px bg-white/20 mb-3"></div>
                                    <p className="text-[11px] font-black uppercase opacity-90 leading-tight">
                                        Winner Certificate And Felicitation <br />
                                        <span className="text-indigo-200">(Competition Among 10 School's Student)</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Center Section: Core Entrance (Hero - Spanned to Fill) */}
                    <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-white relative">
                        <div className="w-full max-w-[460px] animate-fade-up">
                            <div className="text-center mb-6">
                                <h2 className="text-4xl font-black text-slate-950 tracking-tighter mb-1">Student Login</h2>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Authentication Protocol Active</p>
                            </div>

                            <form className="space-y-5" onSubmit={handleLogin}>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-black text-blue-600 uppercase tracking-widest ml-2">Assigned Student ID</label>
                                    <input
                                        type="text"
                                        required
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                                        className="w-full h-15 px-7 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all font-black text-slate-900 text-lg"
                                        placeholder="VK-2026-001"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-black text-blue-600 uppercase tracking-widest ml-2">Security Passphrase</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-15 pl-7 pr-15 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all font-black text-slate-900 text-lg"
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 text-xl transition-colors">
                                            {showPassword ? "👁️" : "🕶️"}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        className="w-full h-18 flex items-center justify-center rounded-2xl shadow-xl shadow-blue-500/20 text-base font-black text-white bg-blue-600 hover:bg-slate-950 transition-all active:scale-[0.98] uppercase tracking-[0.35em] group"
                                    >
                                        Establish Access <span className="ml-4 group-hover:translate-x-2 transition-transform">🚀</span>
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="text-left">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest inline-flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Node Status
                                    </p>
                                    <p className="text-[12px] font-black text-slate-900 mt-1 uppercase">Live & Secure</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[12px] font-black text-rose-500 uppercase underline underline-offset-4 decoration-2">Today 8:30 PM</p>
                                    <p className="text-[11px] font-black text-slate-400 uppercase mt-1 tracking-widest">Global Result</p>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Right Panel: Scholarship & Domains (Edge-to-Edge) */}
                    <aside className="lg:w-[320px] 2xl:w-[380px] border-l border-slate-100 flex flex-col bg-slate-50/30 overflow-hidden">
                        <div className="flex-1 flex flex-col">
                            {/* Scholarship Section */}
                            <div className="p-4 border-b border-slate-100 bg-indigo-900 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 relative z-10">👉 365 DAYS STREAK</h4>
                                <div className="relative z-10 space-y-2">
                                    <p className="text-[20px] font-black leading-tight tracking-tighter text-orange-400">• Top 100 Nos. 1 Lakh Study Scholarship*</p>
                                    <p className="text-[14px] font-black opacity-90 leading-tight">• Privilege Merit Cards For Winners</p>
                                    <p className="text-[9px] font-bold opacity-30 mt-3 uppercase font-sans">* Terms And Conditions Apply</p>
                                </div>
                            </div>

                            {/* Assessment Domains Section (Fills remaining space) */}
                            <div className="flex-1 p-4 bg-white flex flex-col">
                                <h4 className="text-[13px] font-black text-blue-600 uppercase tracking-widest mb-3">ASSESSMENT DOMAINS</h4>
                                <div className="flex-1 flex flex-col justify-between py-2">
                                    {[
                                        { n: "GK & CURRENT AFFAIRS", i: "🧠", c: "bg-blue-50/50" },
                                        { n: "SCIENCE & TECH", i: "🔬", c: "bg-indigo-50/50" },
                                        { n: "SPORTS", i: "🏆", c: "bg-rose-50/50" },
                                        { n: "CORE (BY CLASS)", i: "📚", c: "bg-amber-50/50" },
                                        { n: "HEALTH", i: "🍎", c: "bg-emerald-50/50" }
                                    ].map((dom, idx) => (
                                        <div key={idx} className={`flex items-center gap-4 flex-1 p-3 min-h-0 border border-slate-100 ${dom.c} rounded-2xl transition-all hover:scale-[1.03] hover:shadow-md group cursor-default`}>
                                            <span className="text-xl group-hover:rotate-12 transition-transform">{dom.i}</span>
                                            <span className="text-[12px] font-black text-slate-900 leading-none tracking-tight uppercase">{dom.n}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* 3. Footer (Gaps Removed) */}
                <footer className="px-6 py-2 bg-slate-950 flex items-center justify-between text-white">
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Secure Entry</span>
                        </div>
                        <div className="h-3 w-px bg-slate-800"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Window: 06:00 AM - 08:00 PM</span>
                    </div>
                    <div className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] hidden sm:block">
                        Vajra Systems &copy; 2026 EduQuiz Foundation
                    </div>
                </footer>
            </div>
        </div>
    );
}
