"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function VerifyOTPPage() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    // Countdown for resend button
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleOtpChange = (index: number, value: string) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // take last char (handle paste)
        setOtp(newOtp);
        // Auto-advance to next box
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = [...otp];
        pasted.split("").forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        // Focus last filled box
        const lastIndex = Math.min(pasted.length, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length !== 6) return toast.error("Please enter the complete 6-digit OTP");

        const email = sessionStorage.getItem("reset_email");
        if (!email) {
            toast.error("Session expired. Please start over.");
            return router.push("/faculty/forgot-password");
        }

        setLoading(true);
        try {
            const res = await fetch("/api/faculty/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpString }),
            });
            const data = await res.json();

            if (res.ok && data.resetToken) {
                sessionStorage.setItem("reset_token", data.resetToken);
                toast.success("OTP verified! Set your new password.");
                router.push("/faculty/reset-password");
            } else {
                toast.error(data.error || "Invalid OTP");
                // Clear OTP boxes on error
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        const email = sessionStorage.getItem("reset_email");
        if (!email) return router.push("/faculty/forgot-password");

        try {
            const res = await fetch("/api/faculty/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                toast.success("New OTP sent to your email!");
                setOtp(["", "", "", "", "", ""]);
                setResendCooldown(60);
                inputRefs.current[0]?.focus();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to resend OTP");
            }
        } catch {
            toast.error("Network error. Please try again.");
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
                    <div className="text-center mb-6">
                        <div className="text-4xl mb-2">📧</div>
                        <h2 className="text-xl font-black text-slate-900">Enter OTP</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            We sent a 6-digit code to your email.
                            <br />
                            <span className="font-bold text-slate-600">Valid for 10 minutes.</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 6 OTP Input Boxes */}
                        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    id={`otp_box_${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-11 h-14 text-center text-xl font-black border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-slate-50 text-slate-900 caret-transparent"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.join("").length !== 6}
                            id="verify_otp_btn"
                            className="w-full h-12 flex items-center justify-center rounded-xl shadow-lg shadow-blue-100 text-sm font-black text-white bg-blue-700 hover:bg-blue-800 transition-all disabled:opacity-60 uppercase tracking-widest"
                        >
                            {loading ? "Verifying..." : "Verify OTP →"}
                        </button>
                    </form>

                    {/* Resend */}
                    <div className="mt-5 text-center space-y-2">
                        <p className="text-slate-400 text-xs">Didn't receive the OTP?</p>
                        <button
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className="text-[11px] font-black text-blue-600 hover:text-rose-600 disabled:text-slate-300 uppercase tracking-widest transition-colors"
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                        </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 text-center">
                        <Link
                            href="/faculty/forgot-password"
                            className="text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
                        >
                            ← Try Different Email
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
