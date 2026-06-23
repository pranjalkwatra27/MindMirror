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

interface DashboardData {
    userInfo: {
        name: string;
        email: string;
        targetRole: string;
        yearsOfExperience: number;
    };
    metrics: {
        totalInterviews: number;
        completedInterviews: number;
        averageConfidence: number;
        averageClarity: number;
        placementReadinessScore: number;
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

    const placementScore = data?.metrics?.placementReadinessScore || 0;
    const confidenceScore = Math.round(Number(data?.metrics?.averageConfidence || 0));
    const clarityScore = Math.round(Number(data?.metrics?.averageClarity || 0));

    const quickActions = [
        {
            title: 'Resume Analysis',
            desc: 'Upload & analyze your resume',
            href: '/resume-analysis',
            icon: HiOutlineDocumentText,
            gradient: 'from-violet-500 to-purple-600',
            shadow: 'shadow-violet-500/20',
        },
        {
            title: 'Mock Interview',
            desc: 'Start a practice session',
            href: '/interview-simulator',
            icon: HiOutlineChatBubbleLeftRight,
            gradient: 'from-cyan-500 to-blue-600',
            shadow: 'shadow-cyan-500/20',
        },
        {
            title: 'View Progress',
            desc: 'Track your improvement',
            href: '/progress',
            icon: HiOutlineChartBar,
            gradient: 'from-emerald-500 to-green-600',
            shadow: 'shadow-emerald-500/20',
        },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-cyan-600/20 border border-white/10 p-8 lg:p-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                            Welcome back, <span className="shimmer-text">{user?.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-gray-400 text-lg">
                            {data?.metrics?.totalInterviews
                                ? `You've completed ${data.metrics.totalInterviews} interviews. Keep pushing!`
                                : 'Ready to start your placement preparation journey?'}
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <ScoreCircle score={placementScore} label="Placement Ready" size={110} />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                    <Link key={action.href} href={action.href}>
                        <div className={`glass-card rounded-xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer group shadow-lg ${action.shadow}`}>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg ${action.shadow}`}>
                                <action.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-1">{action.title}</h3>
                            <p className="text-gray-400 text-sm">{action.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Total Interviews',
                        value: data?.metrics?.totalInterviews || 0,
                        icon: HiOutlineChatBubbleLeftRight,
                        color: 'text-violet-400',
                        bg: 'bg-violet-500/10',
                    },
                    {
                        label: 'Confidence',
                        value: `${confidenceScore}%`,
                        icon: HiOutlineTrophy,
                        color: 'text-cyan-400',
                        bg: 'bg-cyan-500/10',
                    },
                    {
                        label: 'Clarity',
                        value: `${clarityScore}%`,
                        icon: HiOutlineArrowTrendingUp,
                        color: 'text-emerald-400',
                        bg: 'bg-emerald-500/10',
                    },
                    {
                        label: 'Completed',
                        value: data?.metrics?.completedInterviews || 0,
                        icon: HiOutlineClock,
                        color: 'text-amber-400',
                        bg: 'bg-amber-500/10',
                    },
                ].map((stat, i) => (
                    <div key={i} className="glass-card rounded-xl p-5">
                        <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Trend */}
                <div className="glass-card rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-6">Performance Trend</h3>
                    {data?.scoreTrend && data.scoreTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={data.scoreTrend}>
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    stroke="#4b5563"
                                    fontSize={11}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                />
                                <YAxis stroke="#4b5563" fontSize={11} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                                />
                                <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#scoreGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">
                            Complete interviews to see your performance trend
                        </div>
                    )}
                </div>

                {/* Score Circles */}
                <div className="glass-card rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-6">Core Metrics</h3>
                    <div className="flex items-center justify-around h-[220px]">
                        <ScoreCircle score={confidenceScore} label="Confidence" size={100} color="#8b5cf6" />
                        <ScoreCircle score={clarityScore} label="Clarity" size={100} color="#06b6d4" />
                        <ScoreCircle score={placementScore} label="Readiness" size={100} color="#22c55e" />
                    </div>
                </div>
            </div>

            {/* Interview Mode Distribution & Weak Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mode Stats */}
                <div className="glass-card rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Interview Distribution</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'HR Round', count: data?.modeStats?.hr || 0, color: 'bg-violet-500', max: Math.max(data?.modeStats?.hr || 1, data?.modeStats?.technical || 1, data?.modeStats?.behavioral || 1, data?.modeStats?.dsa || 1) },
                            { label: 'Technical', count: data?.modeStats?.technical || 0, color: 'bg-cyan-500', max: Math.max(data?.modeStats?.hr || 1, data?.modeStats?.technical || 1, data?.modeStats?.behavioral || 1, data?.modeStats?.dsa || 1) },
                            { label: 'Behavioral', count: data?.modeStats?.behavioral || 0, color: 'bg-emerald-500', max: Math.max(data?.modeStats?.hr || 1, data?.modeStats?.technical || 1, data?.modeStats?.behavioral || 1, data?.modeStats?.dsa || 1) },
                            { label: 'DSA', count: data?.modeStats?.dsa || 0, color: 'bg-amber-500', max: Math.max(data?.modeStats?.hr || 1, data?.modeStats?.technical || 1, data?.modeStats?.behavioral || 1, data?.modeStats?.dsa || 1) },
                        ].map((mode) => (
                            <div key={mode.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300">{mode.label}</span>
                                    <span className="text-gray-400">{mode.count} sessions</span>
                                </div>
                                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${mode.color} transition-all duration-500`}
                                        style={{ width: `${mode.max > 0 ? (mode.count / mode.max) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weak Areas */}
                <div className="glass-card rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Areas to Improve</h3>
                    {data?.weakAreas && data.weakAreas.length > 0 ? (
                        <div className="space-y-3">
                            {data.weakAreas.map((area, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <span className="text-gray-300 text-sm">{area.area}</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                                        {area.frequency}x flagged
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-500">
                            <HiOutlineChartBar className="w-8 h-8 mb-2 text-gray-600" />
                            <p className="text-sm">Complete interviews to discover weak areas</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Interviews */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Recent Sessions</h3>
                    <Link href="/progress" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                        View all →
                    </Link>
                </div>
                {data?.recentInterviews && data.recentInterviews.length > 0 ? (
                    <div className="space-y-3">
                        {data.recentInterviews.map((interview) => (
                            <div key={interview._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium
                    ${interview.mode === 'HR' ? 'bg-violet-500/20 text-violet-400' :
                                            interview.mode === 'Technical' ? 'bg-cyan-500/20 text-cyan-400' :
                                                interview.mode === 'Behavioral' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    'bg-amber-500/20 text-amber-400'}`}
                                    >
                                        {interview.mode?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">{interview.mode} Round</p>
                                        <p className="text-gray-500 text-xs">
                                            {new Date(interview.startTime).toLocaleDateString('en', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {interview.scores?.overallScore !== undefined && (
                                        <span className="text-white font-medium">{Math.round(interview.scores.overallScore)}%</span>
                                    )}
                                    <span className={`text-xs px-2 py-1 rounded-full ${interview.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {interview.completed ? 'Done' : 'In Progress'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                        <HiOutlineChatBubbleLeftRight className="w-10 h-10 mb-3 text-gray-600" />
                        <p className="text-sm mb-4">No interview sessions yet</p>
                        <Link
                            href="/interview-simulator"
                            className="px-4 py-2 rounded-lg bg-violet-500/20 text-violet-400 text-sm hover:bg-violet-500/30 transition-colors"
                        >
                            Start your first interview
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
