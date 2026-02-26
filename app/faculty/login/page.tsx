"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { validateEmail, validatePassword, validateName } from "@/lib/utils/validation";

export default function FacultyAuth() {
    return (
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center font-bold text-slate-400">Loading Portal...</div>}>
            <AuthContent />
        </Suspense>
    );
}

// Registration has 3 steps: 'form' → 'otp' → done (redirects to login)
type RegStep = 'form' | 'otp';

function AuthContent() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ Registration OTP step state
    const [regStep, setRegStep] = useState<RegStep>('form');
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [resendCooldown, setResendCooldown] = useState(0);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const isTeacher = role === 'teacher';

    useEffect(() => {
        if (isTeacher) setIsLogin(true);
    }, [isTeacher]);

    // Resend countdown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    const validateForm = () => {
        if (!isTeacher && !email.trim()) { toast.error("Email is required"); return false; }
        if (isTeacher && !email.trim()) { toast.error("Teacher ID is required"); return false; }
        if (!isTeacher && !validateEmail(email)) {
            toast.error("Invalid email format", { description: "Please enter a valid academic or professional email." });
            return false;
        }
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.isValid) { toast.error(passwordCheck.message); return false; }
        if (!isLogin) {
            if (!validateName(name)) { toast.error("Full name must be at least 3 characters"); return false; }
            if (password !== confirmPassword) { toast.error("Passwords do not match"); return false; }
        }
        return true;
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setEmail(""); setName(""); setPassword(""); setConfirmPassword("");
        setShowPassword(false); setRegStep('form'); setOtp(["", "", "", "", "", ""]);
    };

    // ✅ Step 1: Send OTP on Register click (instead of creating account immediately)
    const handleRegisterSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/faculty/send-registration-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim() }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("OTP sent! Check your email inbox.");
                setRegStep('otp');
                setResendCooldown(60);
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            } else {
                toast.error(data.error || "Failed to send OTP");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Step 2: Verify OTP + Create Account
    const handleRegisterVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length !== 6) { toast.error("Please enter the complete 6-digit OTP"); return; }

        setLoading(true);
        try {
            const res = await fetch('/api/faculty/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    otp: otpString,
                    schoolName: "Vajra International",
                    uniqueId: "EQ" + Date.now(),
                }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("School registered successfully! Please login.");
                setIsLogin(true);
                setRegStep('form');
                setEmail(""); setName(""); setPassword(""); setConfirmPassword("");
                setOtp(["", "", "", "", "", ""]);
            } else {
                toast.error(data.error || "Registration failed");
                if (res.status === 400 && data.error?.includes('expired')) {
                    setRegStep('form');
                    setOtp(["", "", "", "", "", ""]);
                }
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Login handler (unchanged)
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const endpoint = isTeacher ? '/api/teacher/login' : '/api/faculty/login';
        const body = { email, password };

        setLoading(true);
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("faculty_session", JSON.stringify(data.user));
                toast.success(`Welcome back! Logging in as ${isTeacher ? 'Teacher' : 'Faculty'}...`);
                if (data.user.role === 'teacher') {
                    router.push("/faculty/dashboard");
                } else if (data.user.isProfileActive) {
                    router.push("/faculty/dashboard");
                } else {
                    toast.info("Please complete your school profile setup.");
                    router.push("/faculty/dashboard/profile");
                }
            } else {
                if (res.status === 404 || data.code === 'EMAIL_NOT_FOUND' || data.code === 'TEACHER_NOT_FOUND') {
                    toast.error(data.error || "Account not found.");
                } else if (res.status === 401 || data.code === 'INVALID_PASSWORD') {
                    toast.error("Password is incorrect");
                } else {
                    toast.error(data.error || "Something went wrong");
                }
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // OTP box handlers
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    };
    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = [...otp];
        pasted.split("").forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        const lastIndex = Math.min(pasted.length, 5);
        otpRefs.current[lastIndex]?.focus();
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/faculty/send-registration-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim() }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("New OTP sent!");
                setOtp(["", "", "", "", "", ""]);
                setResendCooldown(60);
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            } else {
                toast.error(data.error || "Failed to resend OTP");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[100dvh] w-full bg-[#f8fafc] flex items-center justify-center p-2 font-sans relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-50 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-rose-50 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-7xl h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-4 relative z-10 px-4 sm:px-12">

                {/* Left Side */}
                <div className="hidden lg:flex flex-col gap-6 w-[260px] animate-fade-up">

                </div>

                {/* Center: Form Card */}
                <div className="w-full max-w-md animate-fade-up shrink-0 flex flex-col items-center">
                    <div className="text-center mb-1">
                        <Link href="/" className="inline-block mb-0.5">
                            <span className="text-3xl font-black tracking-tighter text-blue-900">Edu<span className="text-rose-600">Quiz</span></span>
                        </Link>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-0.5">
                            {isTeacher ? "Teacher Portal" : "School Authentication"}
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-2xl py-3 px-8 sm:px-10 shadow-[0_20px_50px_-12px_rgba(0,46,93,0.1)] rounded-[2.5rem] border border-white relative overflow-hidden w-full">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12"></div>

                        <div className="relative z-10">

                            {/* ✅ OTP STEP (Registration Email Verification) */}
                            {!isLogin && regStep === 'otp' ? (
                                <>
                                    <div className="text-center mb-4">
                                        <div className="text-3xl mb-1">📧</div>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Verify Your Email</h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                            Enter the 6-digit code sent to
                                        </p>
                                        <p className="text-sm font-black text-blue-700 mt-0.5 truncate">{email}</p>
                                    </div>

                                    <form onSubmit={handleRegisterVerifyOtp} className="space-y-4">
                                        {/* 6 OTP Boxes */}
                                        <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => { otpRefs.current[index] = el; }}
                                                    id={`reg_otp_${index}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    className="w-10 h-12 text-center text-xl font-black border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-slate-50 text-slate-900 caret-transparent"
                                                />
                                            ))}
                                        </div>

                                        <p className="text-center text-[10px] text-orange-500 font-black">⏱ Valid for 10 minutes</p>

                                        <button
                                            type="submit"
                                            disabled={loading || otp.join("").length !== 6}
                                            id="verify_reg_otp_btn"
                                            className="w-full h-11 flex items-center justify-center rounded-xl shadow-lg shadow-blue-100 text-sm font-black text-white bg-blue-700 hover:bg-black transition-all active:scale-[0.98] uppercase tracking-widest disabled:opacity-60"
                                        >
                                            {loading ? "Verifying..." : "Verify & Create Account"}
                                        </button>
                                    </form>

                                    <div className="mt-3 text-center space-y-1">
                                        <p className="text-slate-400 text-[10px]">Didn't receive the code?</p>
                                        <button
                                            onClick={handleResendOtp}
                                            disabled={resendCooldown > 0 || loading}
                                            className="text-[10px] font-black text-blue-600 hover:text-rose-600 disabled:text-slate-300 uppercase tracking-widest transition-colors"
                                        >
                                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                                        </button>
                                    </div>

                                    <div className="mt-2.5 pt-2 border-t border-slate-50 text-center">
                                        <button
                                            onClick={() => { setRegStep('form'); setOtp(["", "", "", "", "", ""]); }}
                                            className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
                                        >
                                            ← Change Email
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* ✅ FORM STEP (Login or Register) */}
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">
                                        {isLogin ? "Welcome Back" : "Partner Registration"}
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        {isLogin ? `Sign in to your ${isTeacher ? 'Teacher' : 'School'} account` : "Create your school account"}
                                    </p>

                                    <form className="space-y-2" onSubmit={isLogin ? handleLogin : handleRegisterSendOtp} autoComplete="off">
                                        {!isLogin && (
                                            <div className="animate-fade-up">
                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 ml-1">Full Name</label>
                                                <input
                                                    key="register_name"
                                                    id="register_name"
                                                    name="register_name"
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full px-4 py-1.5 border-2 border-slate-50 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all bg-slate-50/50 font-bold text-slate-800 text-sm"
                                                    placeholder="Full Name (e.g. Dr. Rajesh Kumar)"
                                                />
                                            </div>
                                        )}
                                        <div className="animate-fade-up delay-75">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 ml-1">
                                                {isTeacher ? "Teacher ID" : "Email Address"}
                                            </label>
                                            <input
                                                key={isLogin ? "login_email" : "register_email"}
                                                id={isLogin ? "login_email" : "register_email"}
                                                name={isLogin ? "login_email" : "register_email"}
                                                type={isTeacher ? "text" : "email"}
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-1.5 border-2 border-slate-50 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all bg-slate-50/50 font-bold text-slate-800 text-sm"
                                                placeholder={isTeacher ? "Assigned Teacher ID" : "Official Email Address"}
                                            />
                                        </div>
                                        <div className="animate-fade-up delay-100">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 ml-1">Password</label>
                                            <div className="relative">
                                                <input
                                                    key={isLogin ? "login_password" : "register_password"}
                                                    id={isLogin ? "login_password" : "register_password"}
                                                    name={isLogin ? "login_password" : "register_password"}
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full px-4 py-1.5 border-2 border-slate-50 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all bg-slate-50/50 font-bold text-slate-800 text-sm"
                                                    placeholder="Enter secure password"
                                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600"
                                                >
                                                    {showPassword ? "👁️" : "🕶️"}
                                                </button>
                                            </div>
                                            {/* Forgot Password link — only in login mode */}
                                            {isLogin && !isTeacher && (
                                                <div className="text-right mt-1">
                                                    <Link
                                                        href="/faculty/forgot-password"
                                                        className="text-[10px] font-black text-blue-500 hover:text-rose-600 uppercase tracking-widest transition-colors"
                                                    >
                                                        Forgot Password?
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        {!isLogin && (
                                            <div className="animate-fade-up delay-150">
                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 ml-1">Confirm Password</label>
                                                <div className="relative">
                                                    <input
                                                        key="register_confirm_password"
                                                        id="register_confirm_password"
                                                        name="register_confirm_password"
                                                        type={showPassword ? "text" : "password"}
                                                        required
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full px-4 py-1.5 border-2 border-slate-50 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all bg-slate-50/50 font-bold text-slate-800 text-sm"
                                                        placeholder="Re-enter secure password"
                                                        autoComplete="new-password"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-1.5">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                id={isLogin ? "login_submit_btn" : "register_send_otp_btn"}
                                                className="w-full h-11 flex items-center justify-center rounded-xl shadow-lg shadow-blue-100 text-sm font-black text-white bg-blue-700 hover:bg-black transition-all active:scale-[0.98] uppercase tracking-widest disabled:opacity-60"
                                            >
                                                {loading
                                                    ? (isLogin ? "Signing In..." : "Sending OTP...")
                                                    : (isLogin ? "Authorize" : "Send Verification OTP →")
                                                }
                                            </button>
                                        </div>
                                    </form>

                                    {!isTeacher && (
                                        <div className="mt-2.5 pt-2 border-t border-slate-50 flex flex-col items-center gap-1.5">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Access Control</span>
                                            <button
                                                onClick={toggleAuthMode}
                                                className="text-[11px] font-black text-blue-600 hover:text-rose-600 transition-colors uppercase tracking-widest"
                                            >
                                                {isLogin ? "Create School Account" : "Return to Login"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="hidden lg:flex flex-col gap-8 w-[260px] items-end text-right animate-fade-up">

                </div>

            </div>

            {/* Footer */}
            <div className="absolute bottom-2 text-center opacity-30 select-none">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                    &copy; 2026 EduQuiz Vault &bull; v2.0
                </p>
            </div>
        </div>
    );
}
