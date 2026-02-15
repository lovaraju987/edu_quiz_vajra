'use client';

import { useState, useEffect } from 'react';

export default function LaunchOverlay() {
    const [isVisible, setIsVisible] = useState(true);
    const [isCut, setIsCut] = useState(false);
    const [scissorState, setScissorState] = useState<'open' | 'closed'>('open');

    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isVisible]);

    useEffect(() => {
        // Scissor animation loop
        const interval = setInterval(() => {
            setScissorState(prev => prev === 'open' ? 'closed' : 'open');
        }, 600);
        return () => clearInterval(interval);
    }, []);

    const handleCut = () => {
        if (isCut) return;
        setIsCut(true);
        setTimeout(() => {
            setIsVisible(false); // Remove overlay after animation
        }, 2000);
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950 transition-opacity duration-1000 ${isCut ? 'pointer-events-none' : ''}`}>

            {/* 🎥 BACKGROUND GRADIENT & NOISE */}
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#000000_100%)] transition-all duration-[1.5s] ease-in-out ${isCut ? 'opacity-0 scale-110' : 'opacity-100'}`}></div>
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* 🏆 CONTENT CONTAINER */}
            <div className={`relative z-10 flex flex-col items-center gap-16 transition-all duration-700 ${isCut ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'}`}>

                {/* 🌟 LOGO & TITLE */}
                <div className="text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-600 drop-shadow-2xl tracking-tight">
                        EduQuiz.world
                    </h1>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                        <p className="text-amber-100/60 text-sm md:text-lg font-medium tracking-[0.4em] uppercase">
                            Grand Opening Ceremony
                        </p>
                        <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                    </div>
                </div>

                {/* 🎀 INTERACTIVE RIBBON (SVG Based) */}
                <div
                    className="relative w-[100vw] max-w-4xl h-32 flex items-center justify-center cursor-pointer group"
                    onClick={handleCut}
                >
                    {/* LEFT RIBBON HALF */}
                    <div className={`absolute left-0 w-[50%] h-full flex items-center justify-end pr-[2px] transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isCut ? '-translate-x-full opacity-0' : 'translate-x-0'}`}>
                        <div className="w-full h-16 bg-gradient-to-r from-red-800 via-red-600 to-red-500 shadow-2xl relative overflow-hidden rounded-l-sm">
                            {/* Texture */}
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
                            {/* Gold Edge */}
                            <div className="absolute top-0 w-full h-[2px] bg-yellow-400/60"></div>
                            <div className="absolute bottom-0 w-full h-[2px] bg-yellow-400/60"></div>
                        </div>
                    </div>

                    {/* RIGHT RIBBON HALF */}
                    <div className={`absolute right-0 w-[50%] h-full flex items-center justify-start pl-[2px] transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isCut ? 'translate-x-full opacity-0' : 'translate-x-0'}`}>
                        <div className="w-full h-16 bg-gradient-to-l from-red-800 via-red-600 to-red-500 shadow-2xl relative overflow-hidden rounded-r-sm">
                            {/* Texture */}
                            <div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
                            {/* Gold Edge */}
                            <div className="absolute top-0 w-full h-[2px] bg-yellow-400/60"></div>
                            <div className="absolute bottom-0 w-full h-[2px] bg-yellow-400/60"></div>
                        </div>
                    </div>

                    {/* ✂️ SCISSORS ICON (SVG - Centered) */}
                    <div className={`absolute z-20 transition-all duration-500 ${isCut ? 'scale-150 opacity-0 rotate-12' : 'scale-100 opacity-100 group-hover:scale-110'}`}>
                        <div className="relative w-24 h-24 drop-shadow-2xl filter">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-200 fill-current">
                                {/* Handles (Gold) */}
                                <circle cx="30" cy="75" r="8" className="text-yellow-500" stroke="currentColor" strokeWidth="2" fill="none" />
                                <circle cx="70" cy="75" r="8" className="text-yellow-500" stroke="currentColor" strokeWidth="2" fill="none" />

                                {/* Pivot */}
                                <circle cx="50" cy="50" r="3" className="text-gray-400" fill="currentColor" />

                                {/* Blade Left (Animated) */}
                                <path
                                    d="M30 70 L50 50 L20 10 L25 10 L55 50"
                                    className={`origin-[50%_50%] transition-transform duration-300 ease-in-out ${scissorState === 'closed' ? 'rotate-[15deg]' : '-rotate-[10deg]'}`}
                                    fill="url(#bladeGrad)"
                                />
                                {/* Blade Right (Animated) */}
                                <path
                                    d="M70 70 L50 50 L80 10 L75 10 L45 50"
                                    className={`origin-[50%_50%] transition-transform duration-300 ease-in-out ${scissorState === 'closed' ? '-rotate-[15deg]' : 'rotate-[10deg]'}`}
                                    fill="url(#bladeGrad)"
                                />

                                <defs>
                                    <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#d1d5db" />
                                        <stop offset="50%" stopColor="#9ca3af" />
                                        <stop offset="100%" stopColor="#6b7280" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        {/* CTA Tooltip */}
                        <div className="absolute top-[110%] left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-white/80 text-xs tracking-wider font-light bg-black/50 px-2 py-1 rounded">Click to Cut</span>
                        </div>
                    </div>

                </div>

            </div>

            {/* 🎊 CONFETTI BURST (Visible ONLY on Cut) */}
            {isCut && (
                <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className={`absolute w-3 h-3 ${['bg-yellow-400', 'bg-red-500', 'bg-blue-400', 'bg-white'][i % 4]} rounded-sm animate-[fall_3s_ease-out_forwards]`}
                            style={{
                                left: '50%',
                                top: '50%',
                                '--tx': `${(Math.random() - 0.5) * 100}vw`,
                                '--ty': `${(Math.random() - 0.5) * 100}vh`,
                                '--r': `${Math.random() * 720}deg`,
                                animationDelay: `${Math.random() * 0.2}s`
                            } as any}
                        ></div>
                    ))}
                </div>
            )}

            <style jsx global>{`
                @keyframes fall {
                    0% { transform: translate(0,0) rotate(0) scale(0); opacity: 1; }
                    20% { opacity: 1; }
                    100% { transform: translate(var(--tx), var(--ty)) rotate(var(--r)) scale(1); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
