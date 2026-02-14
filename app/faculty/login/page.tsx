"use client";

import { useState, Suspense } from "react";
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

function AuthContent() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const isTeacher = role === 'teacher';

    const validateForm = () => {
        if (!isTeacher && !email.trim()) {
            toast.error("Email is required");
            return false;
        }
        if (isTeacher && !email.trim()) {
            toast.error("Teacher ID is required");
            return false;
        }

        if (!isTeacher && !validateEmail(email)) {
            toast.error("Invalid email format", {
                description: "Please enter a valid academic or professional email."
            });
            return false;
        }

        const passwordCheck = validatePassword(password);
        if (!passwordCheck.isValid) {
            toast.error(passwordCheck.message);
            return false;
        }

        if (!isLogin) {
            if (!validateName(name)) {
                toast.error("Full name must be at least 3 characters");
                return false;
            }
            if (password !== confirmPassword) {
                toast.error("Passwords do not match");
                return false;
            }
        }
        return true;
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setEmail("");
        setName("");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const endpoint = isLogin ? '/api/faculty/login' : '/api/faculty/register';
        const body = isLogin
            ? { [isTeacher ? 'uniqueId' : 'email']: email, password }
            : { name, email, password, schoolName: "Vajra International", uniqueId: "EQ" + Math.floor(Math.random() * 1000) };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                if (isLogin) {
                    localStorage.setItem("faculty_session", JSON.stringify(data.user));
                    toast.success(`Welcome back! Logging in as ${isTeacher ? 'Teacher' : 'Faculty'}...`);
                    if (data.user.isProfileActive) {
                        router.push("/faculty/dashboard");
                    } else {
                        toast.info("Please complete your school profile setup.");
                        router.push("/faculty/dashboard/profile");
                    }
                } else {
                    toast.success("Registration successful! Please login to proceed.");
                    setIsLogin(true);
                }
            } else {
                if (res.status === 404 || data.code === 'EMAIL_NOT_FOUND') {
                    toast.error("Email not found. Please register.");
                    setIsLogin(false);
                    setEmail("");
                    setName("");
                    setPassword("");
                    setConfirmPassword("");
                } else if (res.status === 401 || data.code === 'INVALID_PASSWORD') {
                    toast.error("Password is incorrect");
                } else {
                    toast.error(data.error || "Something went wrong");
                }
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
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

                {/* Left Side: Faculty Value Props */}
                <div className="hidden lg:flex flex-col gap-6 w-[260px] animate-fade-up">
                    <div className="space-y-1">
                        <div className="w-10 h-10 bg-white shadow-md rounded-xl flex items-center justify-center text-blue-600 border border-slate-50">📊</div>
                        <h3 className="text-slate-900 font-black tracking-tight text-base">Monitoring</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider leading-tight">Track assessment progress live with Vajra Intelligence.</p>
                    </div>
                    <div className="space-y-1">
                        <div className="w-10 h-10 bg-white shadow-md rounded-xl flex items-center justify-center text-blue-600 border border-slate-50">🛡️</div>
                        <h3 className="text-slate-900 font-black tracking-tight text-base">Security</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider leading-tight">Encrypted data storage with academic integrity at its core.</p>
                    </div>
                </div>

                {/* Center: The Form Card */}
                <div className="w-full max-w-md animate-fade-up shrink-0 flex flex-col items-center">
                    <div className="text-center mb-1">
                        <Link href="/" className="inline-block mb-0.5">
                            <span className="text-3xl font-black tracking-tighter text-blue-900">Edu<span className="text-rose-600">Quiz</span></span>
                        </Link>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-0.5">School Authentication</p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-2xl py-3 px-8 sm:px-10 shadow-[0_20px_50px_-12px_rgba(0,46,93,0.1)] rounded-[2.5rem] border border-white relative overflow-hidden w-full">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12"></div>

                        <div className="relative z-10">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">
                                {isLogin ? "Welcome" : "Register"}
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                {isLogin ? `Sign in to your ${isTeacher ? 'Teacher' : 'School'} account` : "Create your school account"}
                            </p>

                            <form className="space-y-2" onSubmit={handleSubmit} autoComplete="off">
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
                                            placeholder="Dr. Hemanth Malla"
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
                                        placeholder={isTeacher ? "e.g. VK-T-001" : "faculty@eduquiz.world"}
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
                                            placeholder="••••••••"
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
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-1.5">
                                    <button
                                        type="submit"
                                        className="w-full h-11 flex items-center justify-center rounded-xl shadow-lg shadow-blue-100 text-sm font-black text-white bg-blue-700 hover:bg-black transition-all active:scale-[0.98] uppercase tracking-widest"
                                    >
                                        {isLogin ? "Authorize" : "Register"}
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
                        </div>
                    </div>
                </div>

                {/* Right Side: Deployment Props */}
                <div className="hidden lg:flex flex-col gap-8 w-[260px] items-end text-right animate-fade-up">
                    <div className="space-y-1">
                        <div className="w-10 h-10 bg-white shadow-md rounded-xl flex items-center justify-center text-rose-600 border border-slate-50 ml-auto">🚀</div>
                        <h3 className="text-slate-900 font-black tracking-tight text-base">Cloud Sync</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider leading-tight">Instantly sync your quizes across all institutional nodes.</p>
                    </div>
                    <div className="space-y-1">
                        <div className="w-10 h-10 bg-white shadow-md rounded-xl flex items-center justify-center text-rose-600 border border-slate-50 ml-auto">🧠</div>
                        <h3 className="text-slate-900 font-black tracking-tight text-base">Benchmarking</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider leading-tight">Automated benchmarking and comparative data analysis.</p>
                    </div>
                </div>

            </div>

            {/* Minimal Footer */}
            <div className="absolute bottom-2 text-center opacity-30 select-none">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                    &copy; 2026 EduQuiz Vault &bull; v2.0
                </p>
            </div>
        </div>
    );
}
