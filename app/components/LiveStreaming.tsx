"use client";

import React, { useState, useEffect } from 'react';
import EduQuizLogo from './EduQuizLogo';

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
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);

        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => setSettings(data.settings))
            .catch(err => console.error("Settings fetch failed", err));

        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className="w-full mx-auto p-1 sm:p-2 max-w-[95vw] sm:max-w-full">
            {/* Monitor Stand/Frame */}
            <div className="relative group w-full mx-auto">

                {/* TV Frame - Realistic Metallic/Dark Style */}
                <div className="relative bg-gradient-to-b from-zinc-600 to-zinc-900 rounded-[0.75rem] sm:rounded-[1.5rem] p-1.5 sm:p-3 pt-6 sm:pt-9 border-b-[6px] sm:border-b-[10px] border-zinc-950 border-x-2 sm:border-x-4 border-t-[1px] sm:border-t-2 border-white/20 overflow-hidden">

                    {/* Daily Quiz title on top border */}
                    <div className="absolute top-0 left-0 right-0 h-5 sm:h-7 md:h-9 bg-zinc-800/90 flex items-center justify-center z-40 border-b border-zinc-950/50 gap-2">
                        <span className="text-yellow-400 text-[8px] sm:text-[10px] md:text-base font-black uppercase tracking-[0.2em]" style={{ WebkitTextStroke: '0.4px #991B1B' }}>
                            Quiz Results
                        </span>
                        <span className="text-yellow-400 text-[8px] sm:text-[10px] md:text-base font-black uppercase tracking-[0.1em] animate-pulse">
                            Live at {settings?.resultsReleaseTime ? (
                                parseInt(settings.resultsReleaseTime.split(':')[0]) > 12 ?
                                    `${parseInt(settings.resultsReleaseTime.split(':')[0]) - 12}:${settings.resultsReleaseTime.split(':')[1]} PM` :
                                    `${settings.resultsReleaseTime} AM`
                            ) : "8:30 PM"}
                        </span>
                    </div>

                    {/* Inner Bezel */}
                    <div className="bg-black rounded-[0.5rem] sm:rounded-[1rem] p-0.5 sm:p-1 border border-white/5">

                        {/* Screen Content Area */}
                        <div className="bg-black rounded-md sm:rounded-lg aspect-[19/10] relative overflow-hidden cursor-pointer group-hover:brightness-105 transition-all duration-300" onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}>

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

                            {/* EduQuiz Logo at Top Right - 3D Spinning Image */}
                            <div className="absolute top-1 right-1 z-30">
                                <style jsx>{`
                                    @keyframes rotate3d {
                                        0% { transform: perspective(400px) rotateY(0deg); }
                                        100% { transform: perspective(400px) rotateY(360deg); }
                                    }
                                    .animate-3d-spin {
                                        animation: rotate3d 8s linear infinite;
                                        transform-style: preserve-3d;
                                    }
                                `}</style>
                                <div className="w-5 h-4 sm:w-8 sm:h-7 md:w-10 md:h-8 animate-3d-spin">
                                    <img
                                        src="/images/edu-quiz-spin.png"
                                        alt="EduQuiz Logo"
                                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                                    />
                                </div>
                            </div>



                            {/* Screen Overlay Content - Perfectly Scaled & Centered */}
                            <div className="absolute inset-0 z-20 overflow-hidden">
                                <div className="flex flex-col h-full items-center justify-center gap-0.5 sm:gap-1 py-1 sm:py-2 px-2 sm:px-4">
                                    {/* Header Section */}
                                    <div className="flex flex-col items-center text-center w-full">
                                        <div className="mb-0.5">
                                            <span className="bg-[#4CC9F0] text-slate-900 text-[5px] sm:text-[7px] md:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                                Participate & Win
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center mb-0.5">
                                            <h3 className="text-[7px] sm:text-[9px] md:text-[11px] font-black text-white uppercase leading-[1.1]">
                                                STARTS FROM {settings?.quizStartTime ? (parseInt(settings.quizStartTime.split(':')[0]) > 12 ? `${parseInt(settings.quizStartTime.split(':')[0]) - 12} PM` : `${parseInt(settings.quizStartTime.split(':')[0])} AM`) : "6 AM"} AND ENDS AT {settings?.quizEndTime ? (parseInt(settings.quizEndTime.split(':')[0]) > 12 ? `${parseInt(settings.quizEndTime.split(':')[0]) - 12} PM` : `${parseInt(settings.quizEndTime.split(':')[0])} AM`) : "8 PM"}
                                            </h3>
                                            <h3 className="text-[7px] sm:text-[9px] md:text-[11px] font-black text-white uppercase leading-[1.1]">
                                                365 DAYS CONTINUES PROGRAM
                                            </h3>
                                        </div>
                                        <p className="text-slate-200 text-[5px] sm:text-[7px] md:text-[9px] font-semibold italic w-full opacity-90 line-clamp-1">
                                            Exclusive prizes for top performers
                                        </p>
                                    </div>

                                    {/* Gifts Section */}
                                    <div className="w-full flex flex-col items-center gap-0.5 sm:gap-1">
                                        <p className="text-white text-[6px] sm:text-[8px] md:text-[10px] font-black text-center leading-none flex items-center gap-1">
                                            <span>👉Daily Gifts for 100 Top Performers:</span>
                                        </p>

                                        {/* Row 1 - Gifts */}
                                        <div className="w-full overflow-hidden relative h-8 sm:h-11 md:h-13 bg-black/20 rounded-lg border border-white/5">
                                            <div className="flex animate-scroll-horizontal gap-1.5 sm:gap-2 whitespace-nowrap p-0.5 h-full items-center">
                                                {[
                                                    { src: '/images/gifts/smartwatch.png', name: 'Watch' },
                                                    { src: '/images/gifts/tablet.png', name: 'Tablet' },
                                                    { src: '/images/gifts/learning_kit.png', name: 'Kit' },
                                                    { src: '/images/gifts/voucher.png', name: 'Voucher' },
                                                    { src: '/images/gifts/smartwatch.png', name: 'Gadgets' },
                                                    { src: '/images/gifts/smartwatch.png', name: 'Watch' },
                                                    { src: '/images/gifts/tablet.png', name: 'Tablet' },
                                                    { src: '/images/gifts/learning_kit.png', name: 'Kit' },
                                                    { src: '/images/gifts/voucher.png', name: 'Voucher' },
                                                    { src: '/images/gifts/smartwatch.png', name: 'Gadgets' },
                                                ].map((gift, idx) => (
                                                    <div key={idx} className="flex-shrink-0 w-7 h-7 sm:w-10 sm:h-10 bg-transparent rounded-lg p-0.5 flex flex-col items-center justify-center overflow-hidden">
                                                        <img
                                                            src={gift.src}
                                                            alt={gift.name}
                                                            className="w-full h-[60%] object-contain"
                                                        />
                                                        <span className="text-[3px] sm:text-[5px] text-white uppercase font-black truncate w-full text-center mt-0.5">{gift.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vouchers Section */}
                                    <div className="w-full flex flex-col items-center gap-0.5 sm:gap-1">
                                        <p className="text-white text-[6px] sm:text-[8px] md:text-[10px] font-black text-center leading-none flex items-center gap-1">
                                            <span>👉Exclusive Gift Vouchers:</span>
                                        </p>

                                        {/* Row 2 - Vouchers */}
                                        <div className="w-full overflow-hidden relative h-8 sm:h-11 md:h-13 bg-black/20 rounded-lg border border-white/5">
                                            <div className="flex animate-scroll-horizontal gap-1.5 sm:gap-2 whitespace-nowrap p-0.5 h-full items-center" style={{ animationDirection: 'reverse' }}>
                                                {[
                                                    { src: '/images/gifts/voucher.png', name: 'Amazon' },
                                                    { src: '/images/gifts/voucher.png', name: 'Flipkart' },
                                                    { src: '/images/gifts/voucher.png', name: 'Shopping' },
                                                    { src: '/images/gifts/voucher.png', name: 'Food' },
                                                    { src: '/images/gifts/voucher.png', name: 'Brands' },
                                                    { src: '/images/gifts/voucher.png', name: 'Amazon' },
                                                    { src: '/images/gifts/voucher.png', name: 'Flipkart' },
                                                    { src: '/images/gifts/voucher.png', name: 'Shopping' },
                                                    { src: '/images/gifts/voucher.png', name: 'Food' },
                                                    { src: '/images/gifts/voucher.png', name: 'Brands' },
                                                ].map((voucher, idx) => (
                                                    <div key={idx} className="flex-shrink-0 w-7 h-7 sm:w-10 sm:h-10 bg-transparent rounded-lg p-0.5 flex flex-col items-center justify-center overflow-hidden">
                                                        <img
                                                            src={voucher.src}
                                                            alt={voucher.name}
                                                            className="w-full h-[60%] object-contain"
                                                        />
                                                        <span className="text-[3px] sm:text-[5px] text-white uppercase font-black truncate w-full text-center mt-0.5">{voucher.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Scanlines Overlay for TV feel */}
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-10"></div>



                        </div>
                    </div>
                    {/* TV Stand/Base Button Mockup */}
                    <div className="mt-1.5 flex justify-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-red-500/50"></div>
                        <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                        <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                    </div>
                </div>

                {/* Monitor Stand with Scrolling Live Badge */}
                <div className="relative mx-auto w-20 h-8 sm:w-24 sm:h-10 md:w-28 md:h-12 -mt-1.5 sm:-mt-2 md:-mt-3">
                    {/* Scrolling LIVE Badge on Stand - Eye-catching */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <div className="overflow-hidden rounded-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 border border-red-200 sm:border-2 px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1">
                            <span className="block text-white text-[5px] sm:text-[6px] md:text-[7px] lg:text-[8px] font-black uppercase tracking-wide whitespace-nowrap animate-scroll-text">
                                Edu Quiz
                            </span>
                        </div>
                    </div>

                    {/* Monitor Stand - Realistic Style */}
                    <div className="w-full h-full bg-zinc-700 relative z-10" style={{ clipPath: 'polygon(15% 0, 85% 0, 100% 100%, 0% 100%)' }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
                    </div>
                </div>

                {/* Base */}
                <div className="mx-auto w-28 sm:w-32 md:w-36 h-1 sm:h-1.5 md:h-2 bg-zinc-800 rounded-full -mt-0.5"></div>
            </div>
        </div>
    );
};

export default LiveStreaming;
