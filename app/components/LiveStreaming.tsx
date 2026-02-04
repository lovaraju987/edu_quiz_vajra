"use client";

import React, { useState, useEffect } from 'react';

const LiveStreaming = () => {
    const slides = [
        {
            title: "Rohan Kumar",
            description: "1st Place - Edu Quiz Championship",
            image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1000",
            badge: "Gold Medalist"
        },
        {
            title: "Priya Sharma",
            description: "EduQuiz Monthly Topper - Grade 10",
            image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=1000",
            badge: "Rank #1"
        },
        {
            title: "Greenwood High",
            description: "Most Active School Award 2026",
            image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1000",
            badge: "Top School"
        },
        {
            title: "Daily Winners",
            description: "Felicitation Ceremony at City Center",
            image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&q=80&w=1000",
            badge: "Live Event"
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

                {/* TV Frame - Blue Cartoon Style */}
                <div className="relative bg-[#3b82f6] rounded-[2rem] p-3 shadow-[0_10px_40px_rgba(59,130,246,0.3)] border-b-8 border-r-8 border-blue-700">

                    {/* Inner Bezel */}
                    <div className="bg-slate-900 rounded-[1.5rem] p-1">

                        {/* Screen Content Area */}
                        <div className="bg-slate-900 rounded-[1.2rem] aspect-video relative overflow-hidden cursor-pointer group-hover:brightness-105 transition-all duration-300" onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}>

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
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Gradient Overlay for Text Readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Live Badge & Header */}
                            <div className="absolute top-4 left-6 flex items-center gap-2 z-30">
                                <div className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm animate-pulse">
                                    Live
                                </div>
                                <div className="text-white/90 font-bold text-xs uppercase tracking-wider drop-shadow-md">
                                    EduNews
                                </div>
                            </div>

                            {/* Main Content at Bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 md:p-8">
                                <div className="flex justify-between items-end">
                                    <div className="text-left">
                                        <div className="mb-2">
                                            <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider backdrop-blur-sm">
                                                {slides[currentSlide].badge}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white uppercase drop-shadow-md leading-none mb-1">
                                            {slides[currentSlide].title}
                                        </h3>
                                        <p className="text-slate-200 text-sm font-medium line-clamp-1">
                                            {slides[currentSlide].description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Scanlines Overlay for retro feel */}
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20 z-10"></div>

                            {/* Glare Reflection */}
                            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/10 to-transparent skew-x-12 opacity-30 pointer-events-none z-10"></div>

                            {/* Navigation Dots */}
                            <div className="absolute top-4 right-6 flex flex-col gap-1 z-30">
                                {slides.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-1.5 rounded-full transition-all duration-300 shadow-sm ${currentSlide === index ? 'h-4 bg-white' : 'h-1.5 bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monitor Stand - Cartoon Style */}
                <div className="mx-auto w-32 h-14 bg-slate-400 -mt-4 relative z-0" style={{ clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0% 100%)' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
                <div className="mx-auto w-48 h-3 bg-slate-500 rounded-full shadow-xl opacity-80 -mt-1"></div>
            </div>
        </div>
    );
};

export default LiveStreaming;
