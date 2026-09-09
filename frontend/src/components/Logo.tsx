'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    href?: string;
    className?: string;
}

export default function Logo({
    size = 'md',
    showText = true,
    href = '/',
    className = '',
}: LogoProps) {
    const iconSizes = {
        sm: 'w-7 h-7',
        md: 'w-9 h-9',
        lg: 'w-11 h-11',
        xl: 'w-14 h-14',
    };

    const textSizes = {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-2xl',
        xl: 'text-3xl',
    };

    const badgeSizes = {
        sm: 'text-[9px] px-1.5 py-0.5',
        md: 'text-[10px] px-2 py-0.5',
        lg: 'text-xs px-2.5 py-0.5',
        xl: 'text-xs px-3 py-1',
    };

    const logoContent = (
        <div className={`inline-flex items-center gap-2.5 group cursor-pointer select-none ${className}`}>
            {/* Holographic Glowing Prism Icon */}
            <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
                {/* Ambient dynamic glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-500 blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

                {/* Outer Glass Hex Shield */}
                <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-[#0c122c] via-[#090e23] to-[#040612] border border-cyan-400/40 p-1.5 shadow-inner flex items-center justify-center overflow-hidden group-hover:border-cyan-300 transition-colors">
                    {/* Corner Sheen */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-xl" />

                    {/* Futuristic Dual-Mirror Neural SVG */}
                    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="mmCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                            <linearGradient id="mmPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="100%" stopColor="#c084fc" />
                            </linearGradient>
                        </defs>

                        {/* Left Wing Mirror */}
                        <path
                            d="M6 9L15 4V28L6 23V9Z"
                            fill="url(#mmCyan)"
                            opacity="0.9"
                        />

                        {/* Right Wing Mirror (Reflected) */}
                        <path
                            d="M26 9L17 4V28L26 23V9Z"
                            fill="url(#mmPurple)"
                            opacity="0.9"
                        />

                        {/* Central Neural Reflection Core */}
                        <line x1="16" y1="4" x2="16" y2="28" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
                        <circle cx="16" cy="11" r="2" fill="#ffffff" />
                        <circle cx="16" cy="16" r="2.5" fill="#38bdf8" />
                        <circle cx="16" cy="21" r="2" fill="#c084fc" />

                        {/* Synaptic Link Rays */}
                        <line x1="10" y1="13" x2="16" y2="16" stroke="white" strokeWidth="0.8" opacity="0.7" />
                        <line x1="22" y1="13" x2="16" y2="16" stroke="white" strokeWidth="0.8" opacity="0.7" />
                        <line x1="10" y1="19" x2="16" y2="21" stroke="white" strokeWidth="0.8" opacity="0.7" />
                        <line x1="22" y1="19" x2="16" y2="21" stroke="white" strokeWidth="0.8" opacity="0.7" />
                    </svg>
                </div>
            </div>

            {/* Typography */}
            {showText && (
                <div className="flex items-center gap-1.5">
                    <div className={`font-black tracking-tight flex items-center leading-none ${textSizes[size]}`}>
                        <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">Mind</span>
                        <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent font-extrabold ml-0.5">
                            Mirror
                        </span>
                    </div>

                    <span className={`rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold tracking-wider uppercase font-mono-metric ${badgeSizes[size]}`}>
                        AI
                    </span>
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="focus:outline-none">
                {logoContent}
            </Link>
        );
    }

    return logoContent;
}
