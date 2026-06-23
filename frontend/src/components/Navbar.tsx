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
} from 'react-icons/hi2';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
    { label: 'Resume Analyzer', href: '/resume-analysis', icon: HiOutlineDocumentText },
    { label: 'Interview Simulator', href: '/interview-simulator', icon: HiOutlineChatBubbleLeftRight },
    { label: 'DSA Practice', href: '/dsa-practice', icon: HiOutlinePuzzlePiece },
    { label: 'Progress', href: '/progress', icon: HiOutlineChartBar },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (!user) return null;

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 z-50">
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/25">
                            E
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg tracking-tight">EvolveAI</h1>
                            <p className="text-xs text-gray-400 -mt-0.5">Interview Coach</p>
                        </div>
                    </Link>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive
                                        ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-violet-400' : 'text-gray-500 group-hover:text-violet-400'} transition-colors`} />
                                {item.label}
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{user.name}</p>
                            <p className="text-gray-500 text-xs truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
                    >
                        <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 z-50 flex items-center px-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                        E
                    </div>
                    <h1 className="text-white font-bold">EvolveAI</h1>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="ml-auto text-white p-2"
                >
                    {mobileOpen ? <HiOutlineXMark className="w-6 h-6" /> : <HiOutlineBars3 className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
                    <div className="absolute top-16 left-0 right-0 bg-gray-900 border-b border-white/10 p-4 space-y-1" onClick={(e) => e.stopPropagation()}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive
                                            ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-white'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => { logout(); setMobileOpen(false); }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all w-full"
                        >
                            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
