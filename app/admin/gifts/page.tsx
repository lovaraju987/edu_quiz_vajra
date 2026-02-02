"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function AdminGifts() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageUrl: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/admin/gifts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Gift added successfully");
                setFormData({ title: "", description: "", imageUrl: "" });
            } else {
                toast.error("Failed to add gift");
            }
        } catch (error) {
            toast.error("Connection error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-10 shadow-xl shadow-slate-200/50">
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-pink-200 mb-6 transform rotate-3">
                        🎁
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Add New Gift</h1>
                    <p className="text-slate-500 mt-2 text-lg">Create a new reward for student achievers.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 ml-1">Gift Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                            placeholder="e.g. Premium Smart Watch"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 ml-1">Description</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 h-32 resize-none"
                            placeholder="Describe the gift features and eligibility..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 ml-1">Image URL</label>
                        <div className="relative group">
                            <input
                                type="url"
                                required
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 pl-12"
                                placeholder="https://..."
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50 text-slate-400 group-focus-within:text-pink-500 transition-colors">🔗</span>
                        </div>
                    </div>

                    {formData.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 p-2">
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-white">
                                <img
                                    src={formData.imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                <div className="absolute inset-0 border-4 border-white/20 rounded-xl pointer-events-none"></div>
                            </div>
                            <p className="text-center text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">Image Preview</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-lg rounded-2xl hover:opacity-95 hover:shadow-xl hover:shadow-pink-500/20 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding Gift...
                            </span>
                        ) : (
                            "Add Gift to Catalog"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
