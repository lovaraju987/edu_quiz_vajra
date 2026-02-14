"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Gift {
    _id: string;
    productName: string;
    description: string;
    imageUrl: string;
    originalPrice?: number;
    stock?: number;
}

export default function AdminGifts() {
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState = {
        title: "",
        description: "",
        imageUrl: ""
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchGifts();
    }, []);

    const fetchGifts = async () => {
        try {
            const res = await fetch("/api/admin/gifts");
            const data = await res.json();
            if (res.ok) {
                // Map to handle potential legacy 'title' field or 'productName'
                const normalizedGifts = data.gifts.map((g: any) => ({
                    ...g,
                    productName: g.productName || g.title // Fallback
                }));
                setGifts(normalizedGifts);
            }
        } catch (error) {
            toast.error("Failed to load gifts");
        } finally {
            setIsFetching(false);
        }
    };

    const handleEdit = (gift: Gift) => {
        setIsEditing(true);
        setEditingId(gift._id);
        setFormData({
            title: gift.productName,
            description: gift.description,
            imageUrl: gift.imageUrl
        });
        toast.info(`Editing ${gift.productName}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData(initialFormState);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to PERMANENTLY remove this gift?")) return;

        try {
            const res = await fetch(`/api/admin/gifts/${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                toast.success("Gift deleted successfully");
                fetchGifts(); // Refresh list
            } else {
                toast.error("Failed to delete gift");
            }
        } catch (error) {
            toast.error("Connection error");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = isEditing && editingId
                ? `/api/admin/gifts/${editingId}`
                : "/api/admin/gifts";

            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(isEditing ? "Gift updated successfully" : "Gift added successfully");
                setFormData(initialFormState);
                if (isEditing) handleCancelEdit();
                fetchGifts();
            } else {
                toast.error("Operation failed");
            }
        } catch (error) {
            toast.error("Connection error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manage Gifts</h1>
                    <p className="text-slate-500 mt-1">Create and manage rewards for student achievers.</p>
                </div>
                <div className="bg-pink-50 text-pink-700 px-4 py-2 rounded-xl font-medium text-sm border border-pink-100">
                    Total Gifts: {gifts.length}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className={`rounded-3xl shadow-xl p-8 sticky top-8 transition-all ${isEditing ? "bg-amber-50 border-2 border-amber-200 shadow-amber-100" : "bg-white border border-slate-200 shadow-slate-200/50"
                        }`}>
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4 transform rotate-3 ${isEditing ? "bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-200" : "bg-gradient-to-tr from-pink-500 to-rose-500 shadow-pink-200"
                                }`}>
                                {isEditing ? "✏️" : "🎁"}
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                {isEditing ? "Edit Gift" : "Add New Gift"}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Gift Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    placeholder="e.g. Premium Smart Watch"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 h-24 resize-none"
                                    placeholder="Gift details..."
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
                                        className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 pl-11"
                                        placeholder="https://..."
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-50 text-slate-400 group-focus-within:text-pink-500 transition-colors">🔗</span>
                                </div>
                            </div>

                            {formData.imageUrl && (
                                <div className="rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 p-2">
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-32 object-contain rounded-xl bg-white" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`flex-[2] py-3 text-white font-bold text-lg rounded-xl hover:opacity-95 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ${isEditing ? "bg-amber-500 hover:shadow-amber-500/20" : "bg-gradient-to-r from-pink-600 to-rose-600 hover:shadow-pink-500/20"
                                        }`}
                                >
                                    {isLoading ? "Saving..." : (isEditing ? "Update Gift" : "Add to Catalog")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span>📋</span> Current Inventory
                    </h2>

                    {isFetching ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-2xl"></div>
                            ))}
                        </div>
                    ) : gifts.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                            <div className="text-4xl mb-2 opacity-50">📦</div>
                            <p className="text-slate-500 font-medium">No gifts found. Add your first item!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {gifts.map((gift) => (
                                <div key={gift._id} className={`bg-white rounded-2xl border transition-all relative group overflow-hidden ${editingId === gift._id ? "border-amber-400 ring-2 ring-amber-100" : "border-slate-200 hover:shadow-lg hover:border-pink-200"
                                    }`}>
                                    <div className="relative h-48 bg-slate-50">
                                        <img
                                            src={gift.imageUrl}
                                            alt={gift.productName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-2 group-hover:translate-y-0">
                                            <button
                                                onClick={() => handleEdit(gift)}
                                                className="w-9 h-9 flex items-center justify-center bg-white text-amber-500 rounded-xl shadow-lg hover:scale-110 transition-transform font-bold"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(gift._id)}
                                                className="w-9 h-9 flex items-center justify-center bg-white text-red-500 rounded-xl shadow-lg hover:scale-110 transition-transform font-bold"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{gift.productName}</h3>
                                        </div>
                                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                                            {gift.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
