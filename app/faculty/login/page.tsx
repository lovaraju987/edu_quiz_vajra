"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FacultyAuth() {
    const [isLogin, setIsLogin] = useState(true);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate successful login/registration
        router.push("/faculty/dashboard");
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
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50"
                                    placeholder="Dr. Hemanth Malla"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email address</label>
                            <input
                                type="email"
                                required
                                className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50"
                                placeholder="faculty@eduquiz.world"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50"
                                placeholder="••••••••"
                            />
                        </div>

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
                                onClick={() => setIsLogin(!isLogin)}
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
