"use client";

import React from 'react';

const EduQuizLogo = ({ className = "w-full h-full" }: { className?: string }) => {
    return (
        <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
            {/* Background Drop Shadow Filter */}
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                    <feOffset dx="2" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Q Gradient */}
                <linearGradient id="q-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#32CD32', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#E11D48', stopOpacity: 1 }} />
                </linearGradient>
            </defs>

            <g filter="url(#shadow)" transform="rotate(-5, 200, 150)">
                {/* "Edu" Text */}
                <text x="30" y="140" style={{
                    fontFamily: 'Arial Black, sans-serif',
                    fontSize: '120px',
                    fontWeight: 900,
                    fill: '#880022',
                    letterSpacing: '-5px'
                }}>
                    Edu
                </text>

                {/* Question Mark */}
                <text x="280" y="120" style={{
                    fontFamily: 'Arial Black, sans-serif',
                    fontSize: '150px',
                    fontWeight: 900,
                    fill: '#FF9933',
                    transform: 'rotate(15deg)',
                    transformOrigin: '280px 120px'
                }}>
                    ?
                </text>

                {/* "Quiz" Text with styled Q */}
                <g transform="translate(45, 145)">
                    {/* The styled Q */}
                    <circle cx="95" cy="80" r="55" fill="none" stroke="url(#q-grad)" strokeWidth="25" />
                    <rect x="125" y="110" width="35" height="45" fill="#880022" transform="rotate(-45, 140, 130)" rx="10" />

                    {/* "uiz" Part */}
                    <text x="160" y="125" style={{
                        fontFamily: 'Arial Black, sans-serif',
                        fontSize: '110px',
                        fontWeight: 900,
                        fill: '#1A8754',
                        letterSpacing: '-2px'
                    }}>
                        uiz
                    </text>
                </g>
            </g>
        </svg>
    );
};

export default EduQuizLogo;
