"use client";

import { useState, useEffect } from "react";

export default function BroadcastBanner() {
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchBroadcasts = async () => {
            try {
                const res = await fetch(`/api/admin/broadcast?t=${Date.now()}`, { cache: 'no-store' });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setBroadcasts(data);
                }
            } catch (err) { }
        };

        fetchBroadcasts();
        const interval = setInterval(fetchBroadcasts, 10000); // Check every 10 seconds for live feel
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (broadcasts.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % broadcasts.length);
            }, 8000); // Cycle every 8 seconds
            return () => clearInterval(timer);
        }
    }, [broadcasts.length]);

    if (broadcasts.length === 0) return null;

    const current = broadcasts[currentIndex];

    // Style mapping
    const theme = {
        urgent: "bg-red-600 border-red-700 text-white shadow-red-900/20",
        warning: "bg-amber-500 border-amber-600 text-slate-900 shadow-amber-900/10",
        info: "bg-indigo-600 border-indigo-700 text-white shadow-indigo-900/20",
        success: "bg-emerald-600 border-emerald-700 text-white shadow-emerald-900/20"
    }[current.type as 'urgent' | 'warning' | 'info' | 'success'] || "bg-indigo-600 text-white";

    return (
        <div className={`w-full py-2.5 px-4 border-b flex items-center justify-center relative overflow-hidden transition-all duration-500 shadow-lg z-[60] ${theme}`}>
            <div className="flex items-center gap-3 animate-fade-in text-center max-w-4xl mx-auto">
                <span className="text-lg shrink-0">
                    {current.type === 'urgent' ? '🚨' : current.type === 'warning' ? '⚠️' : '📢'}
                </span>
                <p className="font-bold text-xs md:text-sm tracking-tight leading-tight">
                    <span className="opacity-70 uppercase text-[10px] mr-2 tracking-[0.2em] font-black">
                        {current.type === 'urgent' ? 'Flash Alert:' : 'Announcement:'}
                    </span>
                    {current.message}
                </p>
                {broadcasts.length > 1 && (
                    <span className="text-[10px] font-black opacity-50 ml-4 px-2 py-0.5 bg-black/10 rounded-full">
                        {currentIndex + 1} / {broadcasts.length}
                    </span>
                )}
            </div>

            {/* Animated Ticker Background Decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="whitespace-nowrap font-black text-6xl italic select-none animate-marquee py-2">
                    {current.message} &nbsp; {current.message} &nbsp; {current.message}
                </div>
            </div>
        </div>
    );
}
