'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash, HiOutlineSparkles } from 'react-icons/hi2';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) router.replace('/dashboard');
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-bg flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10 max-w-lg space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-indigo-500/25 animate-float">
                        M
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide mb-3">
                            <HiOutlineSparkles className="w-3.5 h-3.5" />
                            Next-Gen Placement Platform
                        </div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">
                            Accelerate your career with <span className="shimmer-text">MindMirror</span>
                        </h1>
                        <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                            Memory-aware mock interview coaching, algorithmic weakness mapping, ATS resume scoring, and personalized placement roadmaps.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        {[
                            { num: '10K+', label: 'Curated Questions' },
                            { num: '6-Factor', label: 'Readiness Engine' },
                            { num: 'STAR', label: 'Answer Diagnostics' },
                            { num: 'Real-Time', label: 'Voice & NLP' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card rounded-2xl p-4 text-center">
                                <div className="text-xl font-bold font-mono-metric text-white">{stat.num}</div>
                                <div className="text-[11px] text-slate-400 mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md space-y-6">
                    {/* Mobile branding */}
                    <div className="lg:hidden flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            M
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">MindMirror</h1>
                            <p className="text-[10px] text-slate-400">AI Placement Mirror</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
                        <p className="text-slate-400 text-xs">Enter your credentials to access your placement workstation</p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Email Address</label>
                            <div className="relative">
                                <HiOutlineEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@university.edu"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Password</label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-cyan-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating…
                                </>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 text-xs">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
