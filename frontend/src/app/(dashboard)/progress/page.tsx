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
} from 'react-icons/hi2';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

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
    learningRoadmap?: {
        phase: string;
        topics: string[];
        estimatedDays: number;
        priority: string;
    }[];
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
        // Load MCQ quiz history from localStorage
        try {
            const saved = localStorage.getItem('evolveai_dsa_sessions');
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
            name: `Session ${idx + 1}`,
            confidence: i.scores?.confidenceScore || 0,
            clarity: i.scores?.clarityScore || 0,
            technical: i.scores?.technicalAccuracy || 0,
            overall: i.scores?.overallScore || 0,
        }));

    // Radar data
    const radarData = [
        { subject: 'Technical', value: progress?.placementReadiness?.breakdown?.technicalScore || placementData?.breakdown?.technicalScore || 0 },
        { subject: 'Communication', value: progress?.placementReadiness?.breakdown?.communicationScore || placementData?.breakdown?.communicationScore || 0 },
        { subject: 'Behavioral', value: progress?.placementReadiness?.breakdown?.behavioralScore || placementData?.breakdown?.behavioralScore || 0 },
        { subject: 'DSA', value: progress?.placementReadiness?.breakdown?.dsaScore || placementData?.breakdown?.dsaScore || 0 },
    ];

    const placementScore = placementData?.placementReadinessScore || progress?.placementReadiness?.score || 0;

    if (loading) {
        return (
            <div className="p-6 lg:p-8 space-y-6">
                <div className="skeleton h-12 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40" />)}
                </div>
                <div className="skeleton h-64" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Progress & Performance</h1>
                    <p className="text-gray-400">Track your interview preparation journey and improvement over time</p>
                </div>
                <button
                    onClick={calculatePlacement}
                    disabled={calculating}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 flex items-center gap-2 self-start"
                >
                    {calculating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Calculating...
                        </>
                    ) : (
                        <>
                            <HiOutlineTrophy className="w-5 h-5" />
                            Calculate Placement Score
                        </>
                    )}
                </button>
            </div>

            {/* Placement Readiness */}
            <div className="glass-card rounded-2xl p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                    <ScoreCircle score={placementScore} label="Placement Readiness" size={150} />
                    <div className="flex-1 w-full">
                        <h3 className="text-xl font-semibold text-white mb-4">Readiness Breakdown</h3>
                        <div className="space-y-3">
                            {radarData.map((item) => (
                                <div key={item.subject}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">{item.subject}</span>
                                        <span className="text-white font-medium">{item.value}%</span>
                                    </div>
                                    <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        {placementData.strengths && placementData.strengths.length > 0 && (
                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                <h4 className="text-emerald-400 font-medium text-sm mb-3 flex items-center gap-2">
                                    <HiOutlineTrophy className="w-4 h-4" /> Strengths
                                </h4>
                                <div className="space-y-2">
                                    {placementData.strengths.map((s, i) => (
                                        <p key={i} className="text-gray-300 text-sm">✓ {s}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                        {placementData.criticalGaps && placementData.criticalGaps.length > 0 && (
                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                <h4 className="text-red-400 font-medium text-sm mb-3 flex items-center gap-2">
                                    <HiOutlineExclamationTriangle className="w-4 h-4" /> Areas to Improve
                                </h4>
                                <div className="space-y-2">
                                    {placementData.criticalGaps.map((g, i) => (
                                        <p key={i} className="text-gray-300 text-sm">⚠ {g}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Score Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total Sessions', value: interviews.length, icon: HiOutlineChartBar, color: 'violet' },
                    { label: 'HR Rounds', value: interviews.filter(i => i.mode === 'HR').length, icon: HiOutlineAcademicCap, color: 'cyan' },
                    { label: 'Technical', value: interviews.filter(i => i.mode === 'Technical').length, icon: HiOutlineBookOpen, color: 'emerald' },
                    { label: 'DSA Rounds', value: interviews.filter(i => i.mode === 'Rapid-Fire-DSA').length, icon: HiOutlineArrowTrendingUp, color: 'amber' },
                    { label: 'Quiz Sessions', value: dsaSessions.length, icon: HiOutlineTrophy, color: 'pink' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card rounded-xl p-5">
                        <stat.icon className={`w-6 h-6 text-${stat.color}-400 mb-3`} />
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Trend */}
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Score Progression</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="clarGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#4b5563" fontSize={11} />
                                <YAxis stroke="#4b5563" fontSize={11} domain={[0, 100]} />
                                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                                <Area type="monotone" dataKey="confidence" stroke="#8b5cf6" fill="url(#confGrad)" strokeWidth={2} name="Confidence" />
                                <Area type="monotone" dataKey="clarity" stroke="#06b6d4" fill="url(#clarGrad)" strokeWidth={2} name="Clarity" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
                            Complete interviews to see score progression
                        </div>
                    )}
                </div>

                {/* Mode Distribution */}
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Mode Distribution</h3>
                    {interviews.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={[
                                { mode: 'HR', count: interviews.filter(i => i.mode === 'HR').length },
                                { mode: 'Technical', count: interviews.filter(i => i.mode === 'Technical').length },
                                { mode: 'Behavioral', count: interviews.filter(i => i.mode === 'Behavioral').length },
                                { mode: 'DSA', count: interviews.filter(i => i.mode === 'Rapid-Fire-DSA').length },
                            ]}>
                                <XAxis dataKey="mode" stroke="#4b5563" fontSize={11} />
                                <YAxis stroke="#4b5563" fontSize={11} />
                                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Sessions" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
                            Complete interviews to see distribution
                        </div>
                    )}
                </div>
            </div>

            {/* DSA Weakness Mapper */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <HiOutlineBookOpen className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">DSA Weakness Mapper</h3>
                        <p className="text-xs text-gray-400">Topics identified from your technical interviews</p>
                    </div>
                </div>

                {allDSAWeaknesses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allDSAWeaknesses.map((weakness, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-white font-medium">{weakness.topic}</h4>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${weakness.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                            weakness.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        {weakness.difficulty}
                                    </span>
                                </div>
                                {weakness.suggestedResources && weakness.suggestedResources.length > 0 && (
                                    <div className="space-y-1 mt-2">
                                        {weakness.suggestedResources.slice(0, 2).map((resource, ri) => (
                                            <p key={ri} className="text-xs text-gray-400">📚 {resource}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : weakAreasList.length > 0 ? (
                    <div className="space-y-3">
                        {weakAreasList.map(([area, freq], i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                                        <span className="text-red-400 text-sm font-bold">{i + 1}</span>
                                    </div>
                                    <span className="text-gray-300">{area}</span>
                                </div>
                                <span className="text-xs px-3 py-1 rounded-full bg-red-500/15 text-red-400">
                                    {freq}x flagged
                                </span>
                            </div>
                        ))}
                    </div>
                ) : mcqTopicStats.length > 0 ? (
                    <div>
                        <p className="text-xs text-gray-500 mb-4">Based on your DSA quiz practice sessions:</p>
                        <div className="space-y-4">
                            {mcqTopicStats.map((ts, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-300">{ts.topic}</span>
                                        <span className={`font-semibold ${ts.score >= 80 ? 'text-emerald-400' : ts.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                            {ts.score}% ({ts.total} questions)
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-700 ${ts.score >= 80 ? 'bg-emerald-500' : ts.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${ts.score}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <HiOutlineAcademicCap className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Complete DSA interviews or take a quiz to map your weak topics</p>
                        <p className="text-gray-600 text-xs mt-1">Topics include: Arrays, Linked Lists, Dynamic Programming, Graphs, Sorting</p>
                    </div>
                )}
            </div>

            {/* DSA Quiz Practice History */}
            {dsaSessions.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                            <HiOutlineTrophy className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">DSA Quiz History</h3>
                            <p className="text-xs text-gray-400">{dsaSessions.length} practice session{dsaSessions.length !== 1 ? 's' : ''} completed</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {dsaSessions.slice(0, 10).map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${
                                        session.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                        session.score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-red-500/20 text-red-400'}`}>
                                        {session.score}%
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">{session.topic} · {session.difficulty}</p>
                                        <p className="text-gray-500 text-xs">
                                            {new Date(session.date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            {' · '}{session.language}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-right">
                                    <div className="hidden sm:block">
                                        <p className="text-xs text-emerald-400">{session.correct} correct</p>
                                        <p className="text-xs text-red-400">{session.wrong} wrong</p>
                                    </div>
                                    {session.weakTopics.length > 0 && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 hidden md:inline">
                                            ⚠ {session.weakTopics[0]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Interview History */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Interview History</h3>
                {interviews.length > 0 ? (
                    <div className="space-y-3">
                        {interviews.map((interview) => (
                            <div key={interview._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold
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
                                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                            {interview.targetRole && ` • ${interview.targetRole}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {interview.scores?.overallScore !== undefined && (
                                        <div className="text-right">
                                            <p className="text-white font-semibold">{Math.round(interview.scores.overallScore)}%</p>
                                            <p className="text-xs text-gray-500">Score</p>
                                        </div>
                                    )}
                                    <span className={`text-xs px-2.5 py-1 rounded-full ${interview.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {interview.completed ? 'Completed' : 'In Progress'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-gray-500">
                        <HiOutlineChartBar className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                        <p className="text-sm">No interview sessions yet</p>
                        <p className="text-xs text-gray-600 mt-1">Start practicing to build your interview history</p>
                    </div>
                )}
            </div>
        </div>
    );
}
