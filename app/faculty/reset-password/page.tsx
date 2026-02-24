"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            return toast.error("Password must be at least 8 characters");
        }
        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        const email = sessionStorage.getItem("reset_email");
        const resetToken = sessionStorage.getItem("reset_token");

        if (!email || !resetToken) {
            toast.error("Session expired. Please start the reset process again.");
            return router.push("/faculty/forgot-password");
        }

        setLoading(true);
        try {
            const res = await fetch("/api/faculty/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, resetToken, newPassword }),
            });
            const data = await res.json();

            if (res.ok) {
                // ✅ Clear session data
                sessionStorage.removeItem("reset_email");
                sessionStorage.removeItem("reset_token");

                setDone(true);
                toast.success("Password reset successfully!");
                setTimeout(() => router.push("/faculty/login"), 2000);
            } else {
                toast.error(data.error || "Failed to reset password");
                if (res.status === 400) {
                    // Token expired — restart
                    setTimeout(() => router.push("/faculty/forgot-password"), 2000);
                }
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
                    {done ? (
                        <div className="text-center py-6">
                            <div className="text-5xl mb-4">🎉</div>
                            <h2 className="text-xl font-black text-slate-900 mb-2">Password Reset!</h2>
                            <p className="text-slate-500 text-sm">Redirecting you to login...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-black text-slate-900">Set New Password</h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    Choose a strong password for your school account.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* New Password */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="new_password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Minimum 8 characters"
                                            autoComplete="new-password"
                                            className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all bg-slate-50 font-bold text-slate-800 text-sm pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 text-lg"
                                        >
                                            {showPassword ? "👁️" : "🕶️"}
                                        </button>
                                    </div>
                                    {/* Password strength indicator */}
                                    {newPassword && (
                                        <div className="mt-1.5 flex gap-1">
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-all ${newPassword.length >= [8, 10, 12, 14][i]
                                                            ? ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"][i]
                                                            : "bg-slate-100"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirm_password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter your password"
                                        autoComplete="new-password"
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 outline-none transition-all bg-slate-50 font-bold text-slate-800 text-sm ${confirmPassword && confirmPassword !== newPassword
                                                ? "border-red-300 focus:ring-red-50 focus:border-red-500"
                                                : "border-slate-100 focus:ring-blue-50 focus:border-blue-600"
                                            }`}
                                    />
                                    {confirmPassword && confirmPassword !== newPassword && (
                                        <p className="text-red-500 text-xs font-bold mt-1">Passwords do not match</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || newPassword !== confirmPassword || newPassword.length < 8}
                                    id="reset_password_btn"
                                    className="w-full h-12 flex items-center justify-center rounded-xl shadow-lg shadow-blue-100 text-sm font-black text-white bg-blue-700 hover:bg-blue-800 transition-all disabled:opacity-60 uppercase tracking-widest mt-2"
                                >
                                    {loading ? "Resetting..." : "Reset Password ✓"}
                                </button>
                            </form>
                        </>
                    )}

                    {!done && (
                        <div className="mt-4 pt-4 border-t border-slate-50 text-center">
                            <Link
                                href="/faculty/login"
                                className="text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
                            >
                                ← Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
