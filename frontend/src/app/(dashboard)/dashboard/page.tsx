'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import ScoreCircle from '@/components/ScoreCircle';
import {
    HiOutlineDocumentText,
    HiOutlineChatBubbleLeftRight,
    HiOutlineChartBar,
    HiOutlineTrophy,
    HiOutlineArrowTrendingUp,
    HiOutlineClock,
} from 'react-icons/hi2';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ReadinessBreakdown {
    technical: number;
    dsa: number;
    resume: number;
    communication: number;
    projects: number;
    behavioral: number;
    overall: number;
    lastDeltaExplanation: string;
}

interface CopilotData {
    primaryAction: string;
    primaryTask: string;
    targetCompany: string;
    daysRemaining: number;
    deltaExplanation: string;
    urgentFocusArea: string;
}

interface DashboardData {
    userInfo: {
        name: string;
        email: string;
        targetRole: string;
        targetCompanies?: string[];
        yearsOfExperience: number;
    };
    metrics: {
        totalInterviews: number;
        completedInterviews: number;
        averageConfidence: number;
        averageClarity: number;
        placementReadinessScore: number;
    };
    readinessBreakdown?: ReadinessBreakdown;
    copilot?: CopilotData;
    roadmapSummary?: {
        totalDays: number;
        completedDays: number;
        progressPercentage: number;
        todayTask?: { day: number; title: string; task: string; category: string };
    };
    modeStats: {
        hr: number;
        technical: number;
        behavioral: number;
        dsa: number;
    };
    scoreTrend: { date: string; score: number }[];
    weakAreas: { area: string; frequency: number }[];
    recentInterviews: {
        _id: string;
        mode: string;
        startTime: string;
        scores?: { overallScore?: number };
        completed: boolean;
    }[];
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.getDashboard() as { dashboard: DashboardData };
                setData(res.dashboard);
            } catch (err) {
                console.error('Failed to load dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="p-6 lg:p-8 space-y-6">
                <div className="skeleton h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32" />)}
                </div>
                <div className="skeleton h-64 w-full" />
            </div>
        );
    }

    const placementScore = data?.readinessBreakdown?.overall || data?.metrics?.placementReadinessScore || 0;
    const confidenceScore = Math.round(Number(data?.metrics?.averageConfidence || 0));
    const clarityScore = Math.round(Number(data?.metrics?.averageClarity || 0));
    const breakdown = data?.readinessBreakdown || {
        technical: 75, dsa: 68, resume: 80, communication: 72, projects: 70, behavioral: 74, overall: 73,
        lastDeltaExplanation: "Complete technical & DSA mocks to continuously improve your score."
    };
    const copilot = data?.copilot;

    const quickActions = [
        {
            title: 'Placement Roadmap',
            desc: 'Daily adaptive prep plan',
            href: '/roadmap',
            icon: HiOutlineDocumentText,
            gradient: 'from-violet-600 to-indigo-600',
            shadow: 'shadow-violet-500/20',
        },
        {
            title: 'Company Prep Hub',
            desc: 'Google, Amazon & TCS packs',
            href: '/company-prep',
            icon: HiOutlineTrophy,
            gradient: 'from-blue-600 to-cyan-600',
            shadow: 'shadow-blue-500/20',
        },
        {
            title: 'Mock Interview',
            desc: 'STAR & follow-up practice',
            href: '/interview-simulator',
            icon: HiOutlineChatBubbleLeftRight,
            gradient: 'from-pink-600 to-rose-600',
            shadow: 'shadow-pink-500/20',
        },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Hero Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1432] via-[#0d1228] to-[#070914] border border-white/[0.08] p-7 lg:p-9 shadow-2xl backdrop-blur-2xl">
                {/* Background Ambient AI Glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            Target: {data?.userInfo?.targetCompanies?.[0] || 'Top Product Tech'} • {data?.userInfo?.targetRole || 'Software Engineer'}
                        </div>
                        <h1 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight">
                            Welcome back, <span className="shimmer-text">{user?.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-300 text-sm lg:text-base leading-relaxed">
                            {data?.metrics?.totalInterviews
                                ? `You've completed ${data.metrics.totalInterviews} sessions. MindMirror is actively tuning your personalized placement strategy.`
                                : 'Your AI Placement Copilot is ready. Start your baseline interview or upload your resume to generate your roadmap.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
                        <ScoreCircle score={placementScore} label="Placement Readiness" size={110} />
                    </div>
                </div>
            </div>

            {/* AI Placement Copilot Card */}
            {copilot && (
                <div className="rounded-3xl bg-gradient-to-r from-indigo-950/70 via-[#0f1738] to-[#0a1026] border border-indigo-500/30 p-6 lg:p-7 shadow-xl relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2.5 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                                    AI Copilot • Today's Recommended Focus
                                </span>
                            </div>

                            <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight">
                                {copilot.primaryAction}
                            </h2>

                            <p className="text-slate-300 text-xs lg:text-sm leading-relaxed">
                                {copilot.primaryTask}
                            </p>

                            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-indigo-200/90 flex items-center gap-2">
                                <span>📈</span>
                                <span><strong>Why your score changed:</strong> {copilot.deltaExplanation}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                            <Link
                                href="/roadmap"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-cyan-500 transition-all text-center"
                            >
                                Open Daily Roadmap →
                            </Link>
                            <Link
                                href="/company-prep"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium border border-white/[0.08] transition-all text-center"
                            >
                                {copilot.targetCompany} Prep Pack
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Multidimensional Readiness Breakdown */}
            <div className="glass-card rounded-3xl p-6 lg:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                    <div>
                        <h3 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
                            <HiOutlineTrophy className="w-5 h-5 text-indigo-400" />
                            Multi-Dimensional Placement Readiness Engine
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Weighted composition across 6 core industry placement pillars
                        </p>
                    </div>
                    <span className="text-xl font-bold font-mono-metric text-emerald-400">{breakdown.overall}% Ready</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { label: 'Technical Depth', weight: '25%', score: breakdown.technical, color: 'bg-indigo-500', text: 'text-indigo-400' },
                        { label: 'DSA & Algorithms', weight: '20%', score: breakdown.dsa, color: 'bg-cyan-500', text: 'text-cyan-400' },
                        { label: 'Resume & ATS Score', weight: '20%', score: breakdown.resume, color: 'bg-purple-500', text: 'text-purple-400' },
                        { label: 'Communication & Delivery', weight: '15%', score: breakdown.communication, color: 'bg-emerald-500', text: 'text-emerald-400' },
                        { label: 'Flagship Projects', weight: '10%', score: breakdown.projects, color: 'bg-blue-500', text: 'text-blue-400' },
                        { label: 'Behavioral & STAR', weight: '10%', score: breakdown.behavioral, color: 'bg-amber-500', text: 'text-amber-400' },
                    ].map((dim) => (
                        <div key={dim.label} className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.06] space-y-2 hover:border-white/[0.12] transition-colors">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-semibold">{dim.label}</span>
                                <span className="text-slate-400 text-[10px]">Weight: {dim.weight}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className={`text-xl font-bold font-mono-metric ${dim.text}`}>{dim.score}%</span>
                            </div>
                            <div className="w-full bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
                                <div className={`h-1.5 rounded-full ${dim.color} transition-all duration-500`} style={{ width: `${dim.score}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                    <Link key={action.href} href={action.href}>
                        <div className="glass-card rounded-2xl p-6 group cursor-pointer">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
                                <action.icon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-white font-semibold text-base mb-1 group-hover:text-indigo-300 transition-colors">{action.title}</h3>
                            <p className="text-slate-400 text-xs leading-relaxed">{action.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Total Interviews',
                        value: data?.metrics?.totalInterviews || 0,
                        icon: HiOutlineChatBubbleLeftRight,
                        color: 'text-indigo-400',
                        bg: 'bg-indigo-500/15',
                    },
                    {
                        label: 'Avg Confidence',
                        value: `${confidenceScore}%`,
                        icon: HiOutlineTrophy,
                        color: 'text-cyan-400',
                        bg: 'bg-cyan-500/15',
                    },
                    {
                        label: 'Avg Speech Clarity',
                        value: `${clarityScore}%`,
                        icon: HiOutlineArrowTrendingUp,
                        color: 'text-emerald-400',
                        bg: 'bg-emerald-500/15',
                    },
                    {
                        label: 'Completed Sessions',
                        value: data?.metrics?.completedInterviews || 0,
                        icon: HiOutlineClock,
                        color: 'text-amber-400',
                        bg: 'bg-amber-500/15',
                    },
                ].map((stat, i) => (
                    <div key={i} className="glass-card rounded-2xl p-5">
                        <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-bold font-mono-metric text-white">{stat.value}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts & Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Trend Area Chart */}
                <div className="glass-card rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-white font-semibold text-sm">Performance Progression</h3>
                        <span className="text-[11px] text-slate-400">Past Sessions</span>
                    </div>
                    {data?.scoreTrend && data.scoreTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={data.scoreTrend}>
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    stroke="#475569"
                                    fontSize={11}
                                    tickFormatter={(val) => {
                                        const d = new Date(val);
                                        return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis stroke="#475569" fontSize={11} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ background: '#0b1026', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#6366f1" fill="url(#scoreGradient)" strokeWidth={2.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 text-xs">
                            <p>Complete mock interviews to track your trajectory</p>
                        </div>
                    )}
                </div>

                {/* Score Rings Overview */}
                <div className="glass-card rounded-3xl p-6">
                    <h3 className="text-white font-semibold text-sm mb-6">Core Performance Pillars</h3>
                    <div className="flex items-center justify-around h-[220px]">
                        <ScoreCircle score={confidenceScore} label="Confidence" size={100} color="#6366f1" />
                        <ScoreCircle score={clarityScore} label="Clarity" size={100} color="#38bdf8" />
                        <ScoreCircle score={placementScore} label="Readiness" size={100} color="#34d399" />
                    </div>
                </div>
            </div>

            {/* Distribution & Weak Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interview Distribution */}
                <div className="glass-card rounded-3xl p-6">
                    <h3 className="text-white font-semibold text-sm mb-4">Interview Mode Distribution</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Technical Rounds', count: data?.modeStats?.technical || 0, color: 'bg-indigo-500' },
                            { label: 'Rapid-Fire DSA', count: data?.modeStats?.dsa || 0, color: 'bg-cyan-500' },
                            { label: 'Behavioral / STAR', count: data?.modeStats?.behavioral || 0, color: 'bg-emerald-500' },
                            { label: 'HR / Cultural Fit', count: data?.modeStats?.hr || 0, color: 'bg-purple-500' },
                        ].map((mode) => {
                            const total = (data?.modeStats?.hr || 0) + (data?.modeStats?.technical || 0) + (data?.modeStats?.behavioral || 0) + (data?.modeStats?.dsa || 0) || 1;
                            const pct = Math.round((mode.count / total) * 100);
                            return (
                                <div key={mode.label} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-300">{mode.label}</span>
                                        <span className="text-slate-400 font-mono-metric">{mode.count} sessions ({pct}%)</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${mode.color} transition-all duration-500`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Priority Areas to Improve */}
                <div className="glass-card rounded-3xl p-6">
                    <h3 className="text-white font-semibold text-sm mb-4">Areas Needing Immediate Revision</h3>
                    {data?.weakAreas && data.weakAreas.length > 0 ? (
                        <div className="space-y-2.5">
                            {data.weakAreas.map((area, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.025] border border-white/[0.05]">
                                    <span className="text-slate-200 text-xs font-medium">{area.area}</span>
                                    <span className="text-[11px] font-mono-metric px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/25">
                                        {area.frequency}x flagged
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-xs">
                            <HiOutlineChartBar className="w-8 h-8 mb-2 text-slate-400" />
                            <p>No critical weakness flagged yet. Complete more mocks!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Sessions */}
            <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-white font-semibold text-sm">Recent Interview Transcripts</h3>
                        <p className="text-[11px] text-slate-400">Review past feedback and scores</p>
                    </div>
                    <Link href="/progress" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                        View Analytics →
                    </Link>
                </div>

                {data?.recentInterviews && data.recentInterviews.length > 0 ? (
                    <div className="space-y-2.5">
                        {data.recentInterviews.map((interview) => (
                            <div key={interview._id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-colors">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-xs font-bold text-indigo-300">
                                        {interview.mode?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white text-xs font-semibold">{interview.mode} Round</p>
                                        <p className="text-slate-400 text-[10px]">
                                            {new Date(interview.startTime).toLocaleDateString('en', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {interview.scores?.overallScore !== undefined && (
                                        <span className="text-xs font-bold font-mono-metric text-white">{Math.round(interview.scores.overallScore)}%</span>
                                    )}
                                    <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-medium border ${
                                        interview.completed ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300' : 'bg-amber-500/15 border-amber-500/25 text-amber-300'
                                    }`}>
                                        {interview.completed ? 'Evaluated' : 'In Progress'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 flex flex-col items-center justify-center text-slate-400 text-xs">
                        <HiOutlineChatBubbleLeftRight className="w-8 h-8 mb-2 text-slate-400" />
                        <p className="mb-3">No mock sessions recorded yet</p>
                        <Link
                            href="/interview-simulator"
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                        >
                            Launch First Simulation
                        </Link>
                    </div>
                )}
            </div>

        </div>
    );
}
