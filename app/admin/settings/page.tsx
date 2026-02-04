"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
    const [isLoading, setIsLoading] = useState(false);

    // Password Form State
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    // System Settings State
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        aiAutoScheduler: true
    });
    const [loadingSettings, setLoadingSettings] = useState(true);

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/admin/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (data.settings) {
                        setSettings({
                            maintenanceMode: data.settings.maintenanceMode,
                            aiAutoScheduler: data.settings.aiAutoScheduler
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load settings");
            } finally {
                setLoadingSettings(false);
            }
        };
        fetchSettings();
    }, []);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Password updated successfully");
                setPasswords({ current: "", new: "", confirm: "" });
            } else {
                toast.error(data.error || "Failed to update password");
            }
        } catch (error) {
            toast.error("Connection failed");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSetting = async (key: 'maintenanceMode' | 'aiAutoScheduler') => {
        const newValue = !settings[key];
        // Optimistic update
        setSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: newValue }),
            });

            if (!res.ok) {
                // Revert if failed
                setSettings(prev => ({ ...prev, [key]: !newValue }));
                toast.error("Failed to update setting");
            } else {
                toast.success(`${key === 'maintenanceMode' ? 'Maintenance Mode' : 'AI Scheduler'} ${newValue ? 'Enabled' : 'Disabled'}`);
            }
        } catch (error) {
            setSettings(prev => ({ ...prev, [key]: !newValue }));
            toast.error("Connection error");
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>

            {/* Password Management */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                        🔒
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Security</h2>
                        <p className="text-slate-500 text-sm">Manage your password and account access.</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            required
                            value={passwords.current}
                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Min 6 chars"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Confirm New</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Confirm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 mt-2"
                    >
                        {isLoading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>

            {/* System Preferences */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl">
                        ⚙️
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">System Preferences</h2>
                        <p className="text-slate-500 text-sm">Global system configuration.</p>
                    </div>
                </div>

                {loadingSettings ? (
                    <div className="p-8 text-center text-slate-400 animate-pulse">Loading preferences...</div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-800">Maintenance Mode</h3>
                                <p className="text-xs text-slate-500">Disable access for non-admin users.</p>
                            </div>
                            <button
                                onClick={() => toggleSetting('maintenanceMode')}
                                className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${settings.maintenanceMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></span>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-800">AI Auto-Scheduler</h3>
                                <p className="text-xs text-slate-500">Automatically generate quizzes at midnight.</p>
                            </div>
                            <button
                                onClick={() => toggleSetting('aiAutoScheduler')}
                                className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${settings.aiAutoScheduler ? 'bg-green-500' : 'bg-slate-300'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${settings.aiAutoScheduler ? 'translate-x-6' : 'translate-x-0'}`}></span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
