'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    HiOutlineHome,
    HiOutlineChatBubbleLeftRight,
    HiOutlineChartBar,
    HiOutlineArrowRightOnRectangle,
    HiOutlineBars3,
    HiOutlineXMark,
    HiOutlinePuzzlePiece,
    HiOutlineDocumentText,
    HiOutlineBriefcase,
    HiOutlineMap,
    HiOutlineBuildingOffice2,
    HiOutlineUserCircle,
    HiOutlineSparkles,
} from 'react-icons/hi2';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: HiOutlineHome, badge: null },
    { label: 'Placement Roadmap', href: '/roadmap', icon: HiOutlineMap, badge: 'AI' },
    { label: 'Company Prep', href: '/company-prep', icon: HiOutlineBuildingOffice2, badge: null },
    { label: 'Interview Simulator', href: '/interview-simulator', icon: HiOutlineChatBubbleLeftRight, badge: 'Live' },
    { label: 'DSA Practice', href: '/dsa-practice', icon: HiOutlinePuzzlePiece, badge: null },
    { label: 'Resume Analyzer', href: '/resume-analysis', icon: HiOutlineDocumentText, badge: null },
    { label: 'Job Matcher', href: '/job-matcher', icon: HiOutlineBriefcase, badge: null },
    { label: 'Analytics & Progress', href: '/progress', icon: HiOutlineChartBar, badge: null },
    { label: 'Candidate Profile', href: '/profile', icon: HiOutlineUserCircle, badge: null },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (!user) return null;

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 bg-[#090d20]/95 backdrop-blur-2xl border-r border-white/[0.08] z-50 shadow-2xl">
                {/* Brand Logo */}
                <div className="p-5 border-b border-white/[0.08]">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                            M
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-white font-bold text-base tracking-tight group-hover:text-indigo-300 transition-colors">MindMirror</h1>
                                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">AI</span>
                            </div>
                            <p className="text-[11px] text-slate-400 -mt-0.5">Placement & Interview Mirror</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                        Preparation Modules
                    </div>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-gradient-to-r from-indigo-600/25 to-cyan-600/15 text-white border border-indigo-500/30 shadow-md shadow-indigo-500/10'
                                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <item.icon className={`w-4 h-4 shrink-0 transition-colors ${
                                        isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'
                                    }`} />
                                    <span className="truncate">{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                                        item.badge === 'Live'
                                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    }`}>
                                        {item.badge}
                                    </span>
                                )}
                                {isActive && !item.badge && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout Box */}
                <div className="p-3 border-t border-white/[0.08] bg-black/20">
                    <Link
                        href="/profile"
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.06] transition-colors mb-2 group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate group-hover:text-indigo-300 transition-colors">
                                {user.name}
                            </p>
                            <p className="text-slate-400 text-[10px] truncate">{user.email}</p>
                        </div>
                    </Link>

                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all w-full border border-transparent hover:border-rose-500/20"
                    >
                        <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#090d20]/95 backdrop-blur-2xl border-b border-white/[0.08] z-50 flex items-center justify-between px-4">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        M
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-sm">MindMirror</h1>
                        <p className="text-[10px] text-slate-400">AI Placement Mirror</p>
                    </div>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="text-slate-300 hover:text-white p-2 rounded-lg bg-white/5 border border-white/10"
                    aria-label="Toggle navigation menu"
                >
                    {mobileOpen ? <HiOutlineXMark className="w-5 h-5" /> : <HiOutlineBars3 className="w-5 h-5" />}
                </button>
            </header>

            {/* Mobile Menu Dropdown */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-md" onClick={() => setMobileOpen(false)}>
                    <div
                        className="absolute top-16 left-0 right-0 bg-[#0c1024] border-b border-white/10 p-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-indigo-600/25 text-white border border-indigo-500/30 font-semibold'
                                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-5 h-5 text-indigo-400" />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                        <div className="pt-2 border-t border-white/10 mt-2">
                            <button
                                onClick={() => { logout(); setMobileOpen(false); }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-all w-full"
                            >
                                <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

