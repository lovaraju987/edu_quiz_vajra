"use client";

import React from 'react';

const RewardsTicker = () => {
    // One set of content items
    const TickerContent = () => (
        <div className="flex gap-12 items-center shrink-0">
            <div className="flex items-center gap-2">

                <span className="flex items-center gap-2">
                    👉Daily Participants: Daily Gifts For Top 100 Nos. | Gift Vouchers For One Lakh Nos. | (Participants Encouragement Gifts)
                </span>
            </div>
            <div className="flex items-center gap-2">

                <span>👉Every Month End 30th Day Open Quiz At Near By College | Winner Certificate And Felicitation (Competition Among 10 School's Student).</span>
            </div>
            <div className="flex items-center gap-2">

                <span>👉365 Days Participants: Top 100 Nos. 1 Lakh Study Scholarship* With Privilege Merit Cards | * (Terms And Conditions Apply)</span>
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
                {/* 3 repetitions covers all screen sizes — each segment is very wide */}
                {[...Array(3)].map((_, i) => (
                    <TickerContent key={i} />
                ))}
            </div>
        </div>
    );
};

export default RewardsTicker;
