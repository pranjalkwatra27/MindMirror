'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import {
    HiOutlineDocumentText,
    HiOutlineBuildingOffice2,
    HiOutlineArrowRight,
    HiOutlineSparkles,
    HiOutlineCheckCircle,
    HiOutlineMicrophone,
    HiOutlineCpuChip,
    HiOutlineMap,
    HiOutlinePlay,
} from 'react-icons/hi2';

export default function Home() {
    const { user } = useAuth();

    const modules = [
        {
            title: 'Neural Interview Simulator',
            badge: 'Voice & Speech AI',
            badgeColor: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
            icon: HiOutlineMicrophone,
            glowClass: 'glow-card-indigo',
            accent: 'from-rose-500 via-indigo-600 to-cyan-500',
            description: 'Simulate high-stakes Technical, Behavioral, and HR interviews. Analyzes voice cadence, filler word ratios, and STAR structural formulation in real-time.',
            href: user ? '/interview-simulator' : '/login',
            stats: 'STAR Framework + Audio WPM Analysis',
        },
        {
            title: 'ATS Resume Intelligence',
            badge: 'Content Fidelity',
            badgeColor: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
            icon: HiOutlineDocumentText,
            glowClass: 'glow-card',
            accent: 'from-cyan-500 to-blue-600',
            description: 'Extracts quantifiable metric impacts, action verbs, and skill depth from your PDF resume. Accurately predicts ATS match scores against target job descriptions.',
            href: user ? '/resume-analysis' : '/login',
            stats: 'Metric Extraction + Live Skill Sync',
        },
        {
            title: 'Company-Specific Prep Hub',
            badge: 'Tier-1 Blueprints',
            badgeColor: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
            icon: HiOutlineBuildingOffice2,
            glowClass: 'glow-card-purple',
            accent: 'from-amber-500 to-purple-600',
            description: 'Round-by-round blueprints for Google, Amazon, Microsoft, TCS, and on-demand custom employers. Includes historical DSA weightage and culture bar evaluations.',
            href: user ? '/company-prep' : '/login',
            stats: '9+ Tier Profiles + Dynamic Packs',
        },
        {
            title: '21-Day Placement Roadmap',
            badge: 'Dynamic Copilot',
            badgeColor: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
            icon: HiOutlineMap,
            glowClass: 'glow-card-emerald',
            accent: 'from-emerald-500 to-teal-600',
            description: 'Personalized milestone calendar engineered around your weakest DSA topics and target role timeline. Automatically adjusts as your readiness improves.',
            href: user ? '/roadmap' : '/login',
            stats: 'Daily Milestones + Task Verification',
        },
    ];

    const companies = [
        { name: 'Google', tier: 'Tier 1 Product' },
        { name: 'Amazon', tier: 'Tier 1 Product' },
        { name: 'Microsoft', tier: 'Tier 1 Product' },
        { name: 'Adobe', tier: 'Tier 1 Product' },
        { name: 'TCS Digital', tier: 'IT Services' },
        { name: 'Infosys SP', tier: 'IT Services' },
    ];

    return (
        <div className="min-h-screen mesh-gradient-hero text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
            {/* Top Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-[#060817]/80 border-b border-white/[0.08]">
                <div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">
                    <Logo size="md" href="/" />

                    <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
                        <Link href="/interview-simulator" className="hover:text-cyan-300 transition-colors">
                            Interview AI
                        </Link>
                        <Link href="/resume-analysis" className="hover:text-cyan-300 transition-colors">
                            ATS Resume
                        </Link>
                        <Link href="/company-prep" className="hover:text-cyan-300 transition-colors">
                            Company Hub
                        </Link>
                        <Link href="/roadmap" className="hover:text-cyan-300 transition-colors">
                            Roadmap
                        </Link>
                        <Link href="/dsa-practice" className="hover:text-cyan-300 transition-colors">
                            DSA Arena
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
                            >
                                <HiOutlineCpuChip className="w-4 h-4 text-cyan-200" />
                                Go to Studio Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] transition-all"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5"
                                >
                                    <span>Get Started</span>
                                    <HiOutlineArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Hero Section */}
            <main className="flex-1 pt-32 pb-20 px-5 lg:px-8 max-w-7xl mx-auto w-full space-y-24">
                {/* Hero Header */}
                <section className="text-center space-y-7 max-w-4xl mx-auto pt-6">
                    {/* Top Beacon Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-cyan-500/15 to-purple-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-inner shadow-cyan-500/10 backdrop-blur-xl">
                        <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                        <HiOutlineSparkles className="w-4 h-4 text-cyan-300" />
                        Autonomous Placement Intelligence &amp; AI Career Mirror
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                        Mirror Your True Potential with{' '}
                        <span className="shimmer-text">AI Placement Intelligence</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Practice real voice and technical interviews, scan your resume with genuine ATS metrics, and conquer company-specific hiring bars with adaptive memory.
                    </p>

                    {/* Action CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <Link
                            href={user ? '/dashboard' : '/signup'}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2.5 group"
                        >
                            <HiOutlinePlay className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                            <span>Launch Live AI Simulator</span>
                            <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/company-prep"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <HiOutlineBuildingOffice2 className="w-4 h-4 text-indigo-400" />
                            <span>Explore Company Packs</span>
                        </Link>
                    </div>

                    {/* Floating Trust Metric Badges */}
                    <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                            <p className="text-lg lg:text-xl font-extrabold font-mono-metric text-cyan-300">STAR Scoring</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Multi-Dimensional Evaluation</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                            <p className="text-lg lg:text-xl font-extrabold font-mono-metric text-indigo-300">120-150 WPM</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Optimal Cadence Tracking</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                            <p className="text-lg lg:text-xl font-extrabold font-mono-metric text-purple-300">ATS Fidelity</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Action Verbs &amp; Metrics</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                            <p className="text-lg lg:text-xl font-extrabold font-mono-metric text-emerald-300">Adaptive Memory</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Weak-Spot Retargeting</p>
                        </div>
                    </div>
                </section>

                {/* Interactive Live Simulation Preview Card */}
                <section className="relative rounded-3xl bg-gradient-to-br from-[#0e163b]/90 via-[#0a1028]/95 to-[#050714] border border-cyan-500/25 p-7 lg:p-10 shadow-2xl overflow-hidden glow-card">
                    {/* Corner Sheen Accent */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-7 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-bold uppercase tracking-wider">
                                <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-ping" />
                                Live Simulation Engine Active
                            </div>

                            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                                Real-Time Voice Feedback &amp; Follow-Up Cross Examination
                            </h2>

                            <p className="text-slate-300 text-xs lg:text-sm leading-relaxed">
                                Unlike static question banks, MindMirror listens to your actual delivery cadence, detects filler pauses, evaluates your response using the STAR framework, and dynamically generates intelligent follow-ups based on the exact tools and architectural trade-offs you mentioned.
                            </p>

                            <div className="pt-2 flex flex-wrap gap-2.5">
                                <span className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 flex items-center gap-1.5">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" />
                                    STAR Framework Checked
                                </span>
                                <span className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 flex items-center gap-1.5">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-cyan-400" />
                                    Zero Hallucination Scoring
                                </span>
                                <span className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 flex items-center gap-1.5">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-indigo-400" />
                                    Instant Model Fallback
                                </span>
                            </div>
                        </div>

                        {/* Interactive Metric Showcase Box */}
                        <div className="lg:col-span-5 p-5 rounded-2xl bg-black/50 border border-white/[0.08] space-y-4">
                            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                    <HiOutlineMicrophone className="text-cyan-400" />
                                    Candidate Speech Analysis
                                </span>
                                <span className="text-[11px] font-mono-metric font-bold text-emerald-400">
                                    92% Quality Score
                                </span>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                                        <span>Delivery Pacing</span>
                                        <span className="text-cyan-300 font-mono-metric">136 WPM (Optimal)</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full w-[85%]" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                                        <span>STAR Situation &amp; Action Depth</span>
                                        <span className="text-emerald-300 font-mono-metric">94%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 rounded-full w-[94%]" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                                        <span>Filler Word Frequency</span>
                                        <span className="text-purple-300 font-mono-metric">1.2% (Low)</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-400 rounded-full w-[15%]" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-slate-300 italic leading-relaxed">
                                &ldquo;Strong articulation of distributed caching trade-offs. You clearly quantified throughput gains (45k ops/sec).&rdquo;
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4 Core Pillar Cards */}
                <section className="space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                            Autonomous Engineering Career Modules
                        </h2>
                        <p className="text-xs lg:text-sm text-slate-400 max-w-xl mx-auto">
                            Every tool needed to diagnose your gaps, practice mock scenarios, and pass elite hiring bars.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {modules.map((m, idx) => (
                            <Link
                                key={idx}
                                href={m.href}
                                className={`p-7 rounded-3xl border border-white/[0.08] bg-[#0b1028]/80 hover:bg-[#0f1738] transition-all flex flex-col justify-between space-y-5 group ${m.glowClass}`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.accent} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                                            <m.icon className="w-6 h-6" />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${m.badgeColor}`}>
                                            {m.badge}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg lg:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                                            {m.title}
                                        </h3>
                                        <p className="text-xs lg:text-sm text-slate-300 mt-2 leading-relaxed">
                                            {m.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-mono-metric text-[11px]">{m.stats}</span>
                                    <span className="text-cyan-300 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Launch Module →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Company Tiers Banner */}
                <section className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/50 via-[#0d1330] to-cyan-950/50 border border-white/[0.08] space-y-6 text-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Engineered for High-Frequency Hiring Bars
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {companies.map((c, i) => (
                            <Link
                                key={i}
                                href="/company-prep"
                                className="px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-semibold text-slate-200 transition-all flex items-center gap-2"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                <span>{c.name}</span>
                                <span className="text-[10px] text-slate-500">({c.tier})</span>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            {/* Futuristic Footer */}
            <footer className="border-t border-white/[0.08] bg-[#050711] py-10 px-5 lg:px-8 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <Logo size="sm" href="/" />
                        <span>• Autonomous Placement &amp; Interview Intelligence</span>
                    </div>
                    <p>© 2026 MindMirror AI. Built for next-generation engineers.</p>
                </div>
            </footer>
        </div>
    );
}
