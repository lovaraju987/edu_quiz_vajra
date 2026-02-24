"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return toast.error("Please enter your email");

        setLoading(true);
        try {
            const res = await fetch("/api/faculty/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });
            const data = await res.json();

            if (res.ok) {
                setSent(true);
                // Store email for next steps
                sessionStorage.setItem("reset_email", email.trim().toLowerCase());
                toast.success("OTP sent! Check your email inbox.");
                setTimeout(() => router.push("/faculty/verify-otp"), 1500);
            } else {
                toast.error(data.error || "Something went wrong");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[100dvh] w-full bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-50 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-rose-50 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link href="/">
                        <span className="text-3xl font-black tracking-tighter text-blue-900">
                            Edu<span className="text-rose-600">Quiz</span>
                        </span>
                    </Link>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">
                        School Authentication
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white/90 backdrop-blur-2xl py-8 px-8 shadow-[0_20px_50px_-12px_rgba(0,46,93,0.1)] rounded-[2.5rem] border border-white">
                    <div className="mb-6">
                        <h2 className="text-xl font-black text-slate-900">Forgot Password?</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Enter your registered email. We'll send a 6-digit OTP.
                        </p>
                    </div>

                    {sent ? (
                        <div className="text-center py-4">
                            <div className="text-4xl mb-3">📬</div>
                            <p className="font-black text-slate-800">OTP Sent!</p>
                            <p className="text-slate-500 text-sm mt-1">Redirecting to verification...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                    Registered Email
                                </label>
                                <input
                                    id="forgot_email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="school@example.com"
                                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all bg-slate-50 font-bold text-slate-800 text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                id="send_otp_btn"
                                className="w-full h-12 flex items-center justify-center rounded-xl shadow-lg shadow-blue-100 text-sm font-black text-white bg-blue-700 hover:bg-blue-800 transition-all disabled:opacity-60 uppercase tracking-widest"
                            >
                                {loading ? "Sending OTP..." : "Send OTP →"}
                            </button>
                        </form>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-50 text-center">
                        <Link
                            href="/faculty/login"
                            className="text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
                        >
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
