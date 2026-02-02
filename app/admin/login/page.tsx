"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/admin/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            toast.success("Authentication Successful");
            router.push("/admin/dashboard");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-white">

            {/* Left Brand Panel - Professional Side */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#002e5d] text-white flex-col justify-between p-16 relative overflow-hidden">
                {/* Subtle curve or pattern for texture */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                    <Link href="/" className="inline-block transition-opacity hover:opacity-90">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <span className="text-[#002e5d] font-black text-xl">E</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">EduQuiz World</span>
                        </div>
                    </Link>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h1 className="text-5xl font-bold leading-tight tracking-tight">
                        Powering <br />
                        <span className="text-blue-300">Excellence</span> in <br />
                        Education.
                    </h1>
                    <p className="text-blue-100/80 text-lg leading-relaxed">
                        Secure administrative portal for managing institutions, quizzes, and student data with precision and scalability.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-blue-200/60 font-medium tracking-wide">
                    &copy; {new Date().getFullYear()} EduQuiz System. Authorized Personnel Only.
                </div>
            </div>

            {/* Right Form Panel - Clean & Minimalist */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50/50">
                <div className="w-full max-w-sm space-y-8">

                    <div className="flex justify-center lg:hidden mb-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#002e5d] rounded-full flex items-center justify-center">
                                <span className="text-white font-black">E</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900">EduQuiz</span>
                        </Link>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign in</h2>
                        <p className="text-slate-500">Enter your official credentials to access the dashboard.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block" htmlFor="username">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002e5d] focus:border-transparent transition-all shadow-sm"
                                placeholder="admin"
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700 block" htmlFor="password">
                                    Password
                                </label>
                                {/* Optional: Add Forgot Password link here in future */}
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002e5d] focus:border-transparent transition-all shadow-sm"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-[#002e5d] text-white font-bold rounded-lg hover:bg-[#002449] focus:ring-4 focus:ring-blue-900/20 active:scale-[0.99] transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : "Sign In"}
                        </button>
                    </form>

                    <div className="pt-4 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400">
                            By signing in, you agree to our internal data protection policies.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
