'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';
import { validatePassword } from '@/lib/utils/validation';

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanPassword = password.trim();
        if (!validatePassword(cleanPassword)) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (cleanPassword !== confirmPassword.trim()) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/student/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: cleanPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Password updated successfully! Please login with your new password.');
                // Clear local storage items that might be stale
                localStorage.removeItem("currentStudent");
                localStorage.removeItem("student_auth_token");
                localStorage.removeItem("show_result_button");
                localStorage.removeItem("last_quiz_score");
                localStorage.removeItem("last_quiz_total");
                localStorage.removeItem("last_quiz_level");

                await signOut({ redirect: false });
                window.location.href = '/quiz/login';
            } else {
                toast.error(data.error || 'Failed to update password');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        🔒
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-2">Update Password</h1>
                    <p className="text-slate-500 text-sm">
                        For security reasons, please set a new password for your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Updating...' : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
