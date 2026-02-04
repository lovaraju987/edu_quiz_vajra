"use client";

import React from 'react';

const RewardsTicker = () => {
    // One set of content items
    const TickerContent = () => (
        <div className="flex gap-12 items-center shrink-0">
            <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span>Daily Participants: 40% to 50% Gift Vouchers on Gadgets + Gifts for first 1000 rankers</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <span>30 days regular participants: Month end gifts and felicitation at near by College</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xl">💎</span>
                <span>365 days participants: Top 100 nos. 1 lakh Study Scholarship with Privilege Merit Cards</span>
            </div>
            {/* Separator */}
            <span className="text-orange-200 opacity-50">|</span>
        </div>
    );

    return (
        <div className="bg-[#FF9800] text-white overflow-hidden py-3 border-y border-orange-600 relative z-40 shadow-sm">
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                .animate-marquee-scroll {
                    display: flex;
                    width: max-content;
                    animation: marquee 60s linear infinite;
                    will-change: transform;
                }
                .animate-marquee-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <div className="animate-marquee-scroll flex gap-12 items-center text-sm md:text-base font-bold tracking-wide uppercase">
                {/* 
                   Duplicating content enough times to fill screens. 
                   Since 4 items are quite long, 6 repetitions should cover even 4k screens fully 
                   without creating an excessively heavy DOM layer.
                */}
                {[...Array(6)].map((_, i) => (
                    <TickerContent key={i} />
                ))}
            </div>
        </div>
    );
};

export default RewardsTicker;
