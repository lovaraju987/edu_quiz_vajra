"use client";

import React, { useState, useEffect } from 'react';

const LiveStreaming = () => {
    const slides = [
        {
            title: "Premium Tablets",
            description: "Win high-end tablets for academic excellence",
            image: "/images/gifts/tablet.png",
            badge: "Top Prize"
        },
        {
            title: "Smartwatches",
            description: "Exclusive rewards for daily consistent performers",
            image: "/images/gifts/smartwatch.png",
            badge: "Daily Award"
        },
        {
            title: "Learning Kits",
            description: "Comprehensive study sets for top school rankers",
            image: "/images/gifts/learning_kit.png",
            badge: "Merit Gift"
        },
        {
            title: "Gift Vouchers",
            description: "Redeemable vouchers for gadgets and books",
            image: "/images/gifts/voucher.png",
            badge: "Instant Reward"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className="w-full mx-auto p-4">
            {/* Monitor Stand/Frame */}
            <div className="relative group">

                {/* TV Frame - Realistic Metallic/Dark Style */}
                <div className="relative bg-gradient-to-b from-zinc-600 to-zinc-900 rounded-[2rem] p-4 shadow-[0_25px_60px_rgba(0,0,0,0.6)] border-b-[14px] border-zinc-950 border-x-4 border-t-2 border-white/20">

                    {/* Inner Bezel */}
                    <div className="bg-black rounded-[1.5rem] p-1.5 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)]">

                        {/* Screen Content Area */}
                        <div className="bg-black rounded-xl aspect-video relative overflow-hidden cursor-pointer group-hover:brightness-105 transition-all duration-300 shadow-2xl" onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}>

                            {/* Background Image with Blur Transition */}
                            <div className="absolute inset-0 z-0">
                                {slides.map((slide, index) => (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        <img
                                            src={slide.image}
                                            alt={slide.title}
                                            className="w-full h-full object-cover contrast-[110%] brightness-[0.85]"
                                        />
                                        {/* Gradient Overlay for Text Readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
                                    </div>
                                ))}
                            </div>

                            {/* EduQuiz Logo at Top Right */}
                            <div className="absolute top-4 right-6 flex items-center gap-2 z-30">
                                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                                    <div className="w-5 h-5">
                                        <svg viewBox="0 0 100 100" className="w-full h-full shadow-sm">
                                            <circle cx="50" cy="50" r="48" className="fill-[#002e5d]" />
                                            <path
                                                d="M50 22 L58 42 L80 42 L62 55 L70 78 L50 64 L30 78 L38 55 L20 42 L42 42 Z"
                                                className="fill-[#e11d48] stroke-white stroke-[2]"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-wider">EduQuiz World</span>
                                </div>
                            </div>

                            {/* Header Section */}
                            <div className="absolute top-4 left-6 flex items-center gap-2 z-30">
                                <div className="bg-[#4CC9F0] text-slate-900 text-[10px] font-black uppercase px-3 py-1 rounded shadow-lg border border-white/30">
                                    Gifts & Rewards
                                </div>
                            </div>

                            {/* Main Content at Bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-20">
                                <div className="flex justify-between items-end">
                                    <div className="text-left">
                                        <div className="mb-1 md:mb-2">
                                            <span className="bg-[#4CC9F0]/90 text-slate-900 text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 rounded-sm uppercase tracking-wider backdrop-blur-sm">
                                                Participate & Win
                                            </span>
                                        </div>
                                        <h3 className="text-sm md:text-2xl font-black text-white uppercase drop-shadow-md leading-none mb-0.5 md:mb-1 tracking-tight">
                                            Gifts, Rewards & Vouchers
                                        </h3>
                                        <p className="text-slate-300 text-[10px] md:text-sm font-medium line-clamp-1 italic">
                                            Exclusive prizes for top performers
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Scanlines Overlay for TV feel */}
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-10"></div>

                            {/* Glare Reflection */}
                            <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 opacity-40 pointer-events-none z-10"></div>

                            {/* Navigation Dots - Moved to left side sidebar style */}
                            <div className="absolute top-20 right-6 flex flex-col gap-1.5 z-30">
                                {slides.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-1.5 rounded-full transition-all duration-300 shadow-sm ${currentSlide === index ? 'h-5 bg-[#4CC9F0]' : 'h-1.5 bg-white/20'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* TV Stand/Base Button Mockup */}
                    <div className="mt-2 flex justify-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 shadow-sm"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                    </div>
                </div>

                {/* Monitor Stand - Realistic Style */}
                <div className="mx-auto w-32 h-14 bg-zinc-700 -mt-4 relative z-0" style={{ clipPath: 'polygon(15% 0, 85% 0, 100% 100%, 0% 100%)' }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
                </div>
                <div className="mx-auto w-52 h-2.5 bg-zinc-800 rounded-full shadow-2xl -mt-1 border-t border-white/5"></div>
            </div>
        </div>
    );
};

export default LiveStreaming;
