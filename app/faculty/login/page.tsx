"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function FacultyAuth() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();

    const validateForm = () => {
        if (!email.includes('@') || !email.includes('.')) {
            toast.error("Please enter a valid email address");
            return false;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return false;
        }
        if (!isLogin && password !== confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }
        if (!isLogin && name.trim().length < 3) {
            toast.error("Please enter your full name");
            return false;
        }
        return true;
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        // Clear form fields
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
            ? { email, password }
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
                    toast.success("Welcome back! Logging in...");
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
                    // Do NOT toggle here if you want to clear fields, calling toggleAuthMode() effectively
                    setIsLogin(false);
                    // But user wants "vice versa" so let's use the toggle logic carefully
                    // Actually, if simply redirecting, we might want to KEEP the email so they don't type it again?
                    // "if i enter registration details then it should not be seen in login page... and vice versa"
                    // This implies distinct separation. So yes, clear everything.

                    // However, redirecting from Failed Login -> Register usually allows carrying over the email.
                    // But the user strictly asked "not be seen". So I will clear it.

                    setIsLogin(false);
                    // Manually clear since we are setting specific state
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
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6">
                    <span className="text-3xl font-bold tracking-tight text-blue-800">Edu<span className="text-rose-600">Quiz</span></span>
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-slate-900">
                    Faculty {isLogin ? "Login" : "Registration"}
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    {isLogin ? "Welcome back, Professor" : "Join the Edu Quiz faculty program"}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-blue-100/50 rounded-3xl border border-slate-100 sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                <input
                                    key="register_name"
                                    id="register_name"
                                    name="register_name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 text-slate-900"
                                    placeholder="Dr. Hemanth Malla"
                                    autoComplete="off"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email address</label>
                            <input
                                key={isLogin ? "login_email" : "register_email"}
                                id={isLogin ? "login_email" : "register_email"}
                                name={isLogin ? "login_email" : "register_email"}
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 text-slate-900"
                                placeholder="faculty@eduquiz.world"
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <div className="mt-1 relative">
                                <input
                                    key={isLogin ? "login_password" : "register_password"}
                                    id={isLogin ? "login_password" : "register_password"}
                                    name={isLogin ? "login_password" : "register_password"}
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 text-slate-900"
                                    placeholder="••••••••"
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                                <div className="mt-1 relative">
                                    <input
                                        key="register_confirm_password"
                                        id="register_confirm_password"
                                        name="register_confirm_password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 text-slate-900"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98]"
                            >
                                {isLogin ? "Sign In" : "Register Now"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={toggleAuthMode}
                                className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                            >
                                {isLogin ? "Create a new faculty account" : "Sign in to existing account"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
