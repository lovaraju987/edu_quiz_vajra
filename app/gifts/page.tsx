"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/app/components/MainLayout";

interface Gift {
    _id: string;
    productName: string;
    description: string;
    imageUrl: string;
}

export default function GiftsPage() {
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGifts = async () => {
            try {
                const res = await fetch("/api/admin/gifts");
                const data = await res.json();
                if (res.ok) {
                    const validGifts = data.gifts
                        .filter((g: any) => g.imageUrl && g.imageUrl.trim().length > 0)
                        .map((g: any) => ({
                            ...g,
                            productName: g.productName || g.title || 'Untitled Gift'
                        }));
                    setGifts(validGifts);
                }
            } catch (error) {
                console.error("Failed to load gifts");
            } finally {
                setLoading(false);
            }
        };
        fetchGifts();
    }, []);

    return (
        <MainLayout>
            <section className="bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 py-24 md:py-32 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 font-black text-9xl transform rotate-12 pointer-events-none">
                    GIFTS
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-yellow-400/20 border border-yellow-400 text-yellow-300 text-xs font-bold tracking-widest uppercase mb-4">
                        Rewards Program
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">Rewards</span> for Top Achievers
                    </h1>
                    <p className="max-w-2xl mx-auto text-blue-100 text-lg md:text-xl leading-relaxed">
                        Earn points by participating in daily quizzes and redeem them for these amazing gifts. Stay consistent, stay ahead!
                    </p>
                </div>
            </section>

            <section className="py-16 bg-slate-50 min-h-screen">
                <div className="container mx-auto px-4 max-w-7xl">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-96 rounded-3xl bg-white animate-pulse shadow-sm"></div>
                            ))}
                        </div>
                    ) : gifts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <div className="text-6xl mb-4">🎁</div>
                            <h3 className="text-2xl font-bold text-slate-800">No Gifts Available Yet</h3>
                            <p className="text-slate-500 mt-2">Check back soon for new rewards!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {gifts.map((gift) => (
                                <div key={gift._id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                    <div className="relative h-64 overflow-hidden bg-slate-100">
                                        <img
                                            src={gift.imageUrl}
                                            alt={gift.productName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image')}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                            <span className="text-white font-bold text-sm tracking-wide translate-y-4 group-hover:translate-y-0 transition-transform duration-300">View Details</span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{gift.productName}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">
                                            {gift.description}
                                        </p>
                                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Reward</span>
                                            <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </MainLayout>
    );
}
