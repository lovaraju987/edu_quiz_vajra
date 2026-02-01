"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function StudentLogin() {
    const [studentId, setStudentId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`/api/students?idNo=${studentId}`);
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Login failed");
                return;
            }

            const student = Array.isArray(data) ? data[0] : data;

            if (!student) {
                toast.error("Student ID not found! Please check with your faculty.");
                return;
            }

            // Detect Level based on the "Class" field or ID pattern
            const studentClass = (student.class || "").toLowerCase();
            let targetLevel = "1";

            if (studentClass.includes("7") || studentClass.includes("8") || studentId.toUpperCase().startsWith("L2")) {
                targetLevel = "2";
            } else if (studentClass.includes("9") || studentClass.includes("10") || studentId.toUpperCase().startsWith("L3")) {
                targetLevel = "3";
            }

            localStorage.setItem(`student_name_${studentId.toUpperCase()}`, student.name);
            localStorage.setItem(`student_school_${studentId.toUpperCase()}`, student.school || "School");

            localStorage.setItem("currentStudent", JSON.stringify({
                id: studentId.toUpperCase(),
                name: student.name,
                level: targetLevel
            }));

            router.push(`/quiz/levels?level=${targetLevel}&id=${studentId.toUpperCase()}`);
        } catch (error) {
            toast.error("Error connecting to server.");
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6 active:scale-95 transition-transform">
                    <span className="text-3xl font-black tracking-tight text-[#002e5d]">Edu<span className="text-[#e11d48]">Quiz</span> <span className="text-slate-400 font-light">Student</span></span>
                </Link>
                <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">
                    Quiz Entrance 🏆
                </h2>
                <p className="mt-2 text-center text-sm text-slate-500 font-bold uppercase tracking-wider">
                    Enter your credentials to start today's challenge
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-8 shadow-2xl shadow-blue-100/50 rounded-[40px] border border-slate-100 sm:px-12 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

                    <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Student ID (EQ-XXXX)</label>
                            <input
                                type="text"
                                required
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                                className="block w-full px-5 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-[#002e5d] outline-none transition-all bg-slate-50 font-bold text-slate-800 placeholder:text-slate-300"
                                placeholder="EQ-1001"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-5 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-[#002e5d] outline-none transition-all bg-slate-50 font-bold text-slate-800 placeholder:text-slate-300"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#002e5d] transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full h-16 flex items-center justify-center rounded-2xl shadow-[0_10px_20px_rgba(0,46,93,0.2)] text-sm font-black text-white bg-[#002e5d] border-b-4 border-[#001d3d] hover:bg-[#003d7a] transition-all active:scale-[0.98] active:border-b-0 uppercase tracking-widest"
                            >
                                Enter Quiz Hall <span className="ml-2">🚀</span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-400 font-bold italic">
                            Help? Contact your school faculty for ID assignment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
