'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ScoreCircle from '@/components/ScoreCircle';
import {
    HiOutlineChartBar,
    HiOutlineAcademicCap,
    HiOutlineTrophy,
    HiOutlineBookOpen,
    HiOutlineArrowTrendingUp,
    HiOutlineExclamationTriangle,
    HiOutlineSparkles,
} from 'react-icons/hi2';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface InterviewRecord {
    _id: string;
    mode: string;
    targetRole?: string;
    startTime: string;
    endTime?: string;
    scores?: {
        confidenceScore?: number;
        clarityScore?: number;
        technicalAccuracy?: number;
        overallScore?: number;
    };
    completed: boolean;
    weakAreasIdentified?: string[];
    dsaWeaknessList?: {
        topic: string;
        difficulty: string;
        suggestedResources?: string[];
    }[];
}

interface DsaSession {
    id: string;
    date: string;
    topic: string;
    difficulty: string;
    language: string;
    score: number;
    correct: number;
    wrong: number;
    skipped: number;
    total: number;
    weakTopics: string[];
    topicBreakdown: { topic: string; total: number; correct: number; score: number }[];
}

interface ProgressData {
    metrics?: {
        totalInterviews: number;
        hrRounds: number;
        technicalRounds: number;
        behavioralRounds: number;
        dsaRounds: number;
    };
    scoreHistory?: {
        date: string;
        confidenceScore: number;
        clarityScore: number;
        overallScore: number;
        mode: string;
    }[];
    weakAreas?: {
        topic: string;
        frequency: number;
        suggestedResources?: string[];
    }[];
    placementReadiness?: {
        score: number;
        breakdown?: {
            technicalScore?: number;
            communicationScore?: number;
            behavioralScore?: number;
            dsaScore?: number;
        };
    };
}

export default function ProgressPage() {
    const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [placementData, setPlacementData] = useState<{
        placementReadinessScore?: number;
        breakdown?: Record<string, number>;
        strengths?: string[];
        criticalGaps?: string[];
        recommendedNextSteps?: string[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [dsaSessions, setDsaSessions] = useState<DsaSession[]>([]);

    useEffect(() => {
        loadData();
        try {
            const saved = localStorage.getItem('mindmirror_dsa_sessions') || localStorage.getItem('evolveai_dsa_sessions');
            if (saved) setDsaSessions(JSON.parse(saved));
        } catch { /* ignore */ }
    }, []);

    const loadData = async () => {
        try {
            const [historyRes, progressRes] = await Promise.all([
                api.getInterviewHistory() as Promise<{ interviews: InterviewRecord[] }>,
                api.getProgress() as Promise<{ progress: ProgressData }>,
            ]);
            setInterviews(historyRes.interviews || []);
            setProgress(progressRes.progress || null);
        } catch (err) {
            console.error('Failed to load progress:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculatePlacement = async () => {
        setCalculating(true);
        try {
            const res = await api.getPlacementScore() as { placementReadiness: typeof placementData };
            setPlacementData(res.placementReadiness);
        } catch (err) {
            console.error('Failed to calculate:', err);
        } finally {
            setCalculating(false);
        }
    };

    // Extract all DSA weaknesses from interviews
    const allDSAWeaknesses: { topic: string; difficulty: string; suggestedResources?: string[] }[] = [];
    interviews.forEach(interview => {
        if (interview.dsaWeaknessList) {
            interview.dsaWeaknessList.forEach(weakness => {
                const existing = allDSAWeaknesses.find(w => w.topic === weakness.topic);
                if (!existing) {
                    allDSAWeaknesses.push(weakness);
                }
            });
        }
    });

    // Extract weak areas frequency
    const weakAreaMap: Record<string, number> = {};
    interviews.forEach(interview => {
        if (interview.weakAreasIdentified) {
            interview.weakAreasIdentified.forEach(area => {
                weakAreaMap[area] = (weakAreaMap[area] || 0) + 1;
            });
        }
    });
    const weakAreasList = Object.entries(weakAreaMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    // Aggregate MCQ quiz topic scores from localStorage sessions
    const mcqTopicMap: Record<string, { total: number; correct: number }> = {};
    dsaSessions.forEach(s => {
        s.topicBreakdown?.forEach(tb => {
            if (!mcqTopicMap[tb.topic]) mcqTopicMap[tb.topic] = { total: 0, correct: 0 };
            mcqTopicMap[tb.topic].total += tb.total;
            mcqTopicMap[tb.topic].correct += tb.correct;
        });
    });
    const mcqTopicStats = Object.entries(mcqTopicMap)
        .map(([topic, s]) => ({ topic, score: Math.round((s.correct / s.total) * 100), total: s.total }))
        .sort((a, b) => a.score - b.score);

    // Build score history for charts
    const chartData = interviews
        .filter(i => i.completed && i.scores)
        .reverse()
        .map((i, idx) => ({
            name: `S${idx + 1}`,
            confidence: i.scores?.confidenceScore || 0,
            clarity: i.scores?.clarityScore || 0,
            technical: i.scores?.technicalAccuracy || 0,
            overall: i.scores?.overallScore || 0,
        }));

    const radarData = [
        { subject: 'Technical Depth', value: progress?.placementReadiness?.breakdown?.technicalScore || placementData?.breakdown?.technicalScore || 0 },
        { subject: 'Communication & Delivery', value: progress?.placementReadiness?.breakdown?.communicationScore || placementData?.breakdown?.communicationScore || 0 },
        { subject: 'Behavioral & STAR', value: progress?.placementReadiness?.breakdown?.behavioralScore || placementData?.breakdown?.behavioralScore || 0 },
        { subject: 'DSA & Algorithms', value: progress?.placementReadiness?.breakdown?.dsaScore || placementData?.breakdown?.dsaScore || 0 },
    ];

    const placementScore = placementData?.placementReadinessScore || progress?.placementReadiness?.score || 0;

    if (loading) {
        return (
            <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
                <div className="skeleton h-36 w-full rounded-3xl" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-24 rounded-2xl" />
                    ))}
                </div>
                <div className="skeleton h-64 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto animate-fade-in">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1432] via-[#0d1228] to-[#070914] border border-white/[0.08] p-7 lg:p-9 shadow-2xl backdrop-blur-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
                            <HiOutlineSparkles className="w-3.5 h-3.5" />
                            Comprehensive Progress Engine
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                            Performance Analytics &amp; Trajectory
                        </h1>
                        <p className="text-slate-300 text-xs lg:text-sm max-w-2xl leading-relaxed">
                            Continuous multi-dimensional evaluation measuring your progression toward target company placement.
                        </p>
                    </div>

                    <button
                        onClick={calculatePlacement}
                        disabled={calculating}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 disabled:opacity-40 transition-all flex items-center gap-2 self-start lg:self-auto shrink-0"
                    >
                        {calculating ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Re-Calculating Score…
                            </>
                        ) : (
                            <>
                                <HiOutlineTrophy className="w-4 h-4" />
                                Recalculate Placement Score
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Placement Readiness Breakdown */}
            <div className="glass-card rounded-3xl p-7 lg:p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="shrink-0">
                        <ScoreCircle score={placementScore} label="Placement Readiness" size={135} />
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                            Core Readiness Pillars
                        </h3>
                        <div className="space-y-3">
                            {radarData.map((item) => (
                                <div key={item.subject} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-300 font-medium">{item.subject}</span>
                                        <span className="text-white font-bold font-mono-metric">{item.value}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-700"
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Strengths & Gaps */}
                {placementData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/[0.08]">
                        {placementData.strengths && placementData.strengths.length > 0 && (
                            <div className="p-4 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20 space-y-2">
                                <h4 className="text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                                    <HiOutlineTrophy className="w-3.5 h-3.5 text-emerald-400" />
                                    Validated Strengths
                                </h4>
                                <div className="space-y-1">
                                    {placementData.strengths.map((s, i) => (
                                        <p key={i} className="text-slate-300 text-xs leading-relaxed">✓ {s}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {placementData.criticalGaps && placementData.criticalGaps.length > 0 && (
                            <div className="p-4 rounded-2xl bg-rose-500/[0.05] border border-rose-500/20 space-y-2">
                                <h4 className="text-rose-300 font-bold text-xs flex items-center gap-1.5">
                                    <HiOutlineExclamationTriangle className="w-3.5 h-3.5 text-rose-400" />
                                    Priority Areas to Reinforce
                                </h4>
                                <div className="space-y-1">
                                    {placementData.criticalGaps.map((g, i) => (
                                        <p key={i} className="text-slate-300 text-xs leading-relaxed">⚠️ {g}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Score Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total Simulations', value: interviews.length, icon: HiOutlineChartBar, color: 'text-indigo-400', bg: 'bg-indigo-500/15' },
                    { label: 'HR Rounds', value: interviews.filter(i => i.mode === 'HR').length, icon: HiOutlineAcademicCap, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
                    { label: 'Technical Sessions', value: interviews.filter(i => i.mode === 'Technical').length, icon: HiOutlineBookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
                    { label: 'Rapid DSA', value: interviews.filter(i => i.mode === 'Rapid-Fire-DSA').length, icon: HiOutlineArrowTrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/15' },
                    { label: 'DSA Quizzes', value: dsaSessions.length, icon: HiOutlineTrophy, color: 'text-purple-400', bg: 'bg-purple-500/15' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card rounded-2xl p-5">
                        <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-bold font-mono-metric text-white">{stat.value}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Trend */}
                <div className="glass-card rounded-3xl p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-6">Historical Score Progression</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={230}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="clarGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#475569" fontSize={11} />
                                <YAxis stroke="#475569" fontSize={11} domain={[0, 100]} />
                                <Tooltip contentStyle={{ background: '#0b1026', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="confidence" stroke="#6366f1" fill="url(#confGrad)" strokeWidth={2} name="Confidence" />
                                <Area type="monotone" dataKey="clarity" stroke="#38bdf8" fill="url(#clarGrad)" strokeWidth={2} name="Clarity" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[230px] flex items-center justify-center text-slate-400 text-xs">
                            Complete mock interviews to track your trajectory
                        </div>
                    )}
                </div>

                {/* Mode Distribution */}
                <div className="glass-card rounded-3xl p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-6">Simulation Modes Completed</h3>
                    {interviews.length > 0 ? (
                        <ResponsiveContainer width="100%" height={230}>
                            <BarChart data={[
                                { mode: 'HR Round', count: interviews.filter(i => i.mode === 'HR').length },
                                { mode: 'Technical', count: interviews.filter(i => i.mode === 'Technical').length },
                                { mode: 'Behavioral', count: interviews.filter(i => i.mode === 'Behavioral').length },
                                { mode: 'DSA', count: interviews.filter(i => i.mode === 'Rapid-Fire-DSA').length },
                            ]}>
                                <XAxis dataKey="mode" stroke="#475569" fontSize={11} />
                                <YAxis stroke="#475569" fontSize={11} />
                                <Tooltip contentStyle={{ background: '#0b1026', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Completed Sessions" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[230px] flex items-center justify-center text-slate-400 text-xs">
                            Complete interviews to see distribution
                        </div>
                    )}
                </div>
            </div>

            {/* DSA Weakness Mapper */}
            <div className="glass-card rounded-3xl p-6 lg:p-7 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                        <HiOutlineBookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">DSA Weakness Diagnostic</h3>
                        <p className="text-[11px] text-slate-400">Algorithms &amp; data structures flagged across your mock interviews</p>
                    </div>
                </div>

                {allDSAWeaknesses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allDSAWeaknesses.map((weakness, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white font-semibold text-xs">{weakness.topic}</h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                                        weakness.difficulty === 'Easy' ? 'bg-emerald-500/15 text-emerald-300' :
                                        weakness.difficulty === 'Medium' ? 'bg-amber-500/15 text-amber-300' :
                                        'bg-rose-500/15 text-rose-300'
                                    }`}>
                                        {weakness.difficulty}
                                    </span>
                                </div>
                                {weakness.suggestedResources && (
                                    <div className="space-y-1 text-slate-400 text-xs">
                                        {weakness.suggestedResources.slice(0, 2).map((r, ri) => (
                                            <p key={ri}>📚 {r}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : weakAreasList.length > 0 ? (
                    <div className="space-y-2">
                        {weakAreasList.map(([area, freq], i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                <span className="text-slate-300 text-xs">{area}</span>
                                <span className="text-[11px] font-mono-metric px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/25">
                                    {freq}x flagged
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-xs py-4 text-center">Complete technical interview simulations or DSA quizzes to automatically map topic weak spots.</p>
                )}
            </div>

            {/* Interview History */}
            <div className="glass-card rounded-3xl p-6 lg:p-7 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Full Session History</h3>
                {interviews.length > 0 ? (
                    <div className="space-y-2.5">
                        {interviews.map((interview) => (
                            <div key={interview._id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-colors">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-xs font-bold text-indigo-300">
                                        {interview.mode?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white text-xs font-semibold">{interview.mode} Round</p>
                                        <p className="text-slate-400 text-[10px]">
                                            {new Date(interview.startTime).toLocaleDateString('en', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                            {interview.targetRole && ` • ${interview.targetRole}`}
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
                    <p className="text-slate-400 text-xs py-4 text-center">No simulation sessions recorded yet.</p>
                )}
            </div>
        </div>
    );
}
