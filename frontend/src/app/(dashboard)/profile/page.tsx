'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
    HiOutlineUserCircle,
    HiOutlineBriefcase,
    HiOutlineBuildingOffice2,
    HiOutlineAcademicCap,
    HiOutlineSparkles,
    HiOutlineCheck,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineCpuChip,
    HiOutlineChatBubbleBottomCenterText,
} from 'react-icons/hi2';

interface CandidateMemoryData {
    targetRole?: string;
    targetCompanies?: string[];
    targetDays?: number;
    candidateMemory?: {
        weakDSATopics?: string[];
        projectHighlights?: { title: string; tech: string; description: string }[];
        speechMetrics?: { avgWpm: number; fillerWordFrequency: number };
        recurringMistakes?: string[];
        lastInterviewerFeedback?: string;
        lastUpdated?: string;
    };
    readinessBreakdown?: {
        technical?: number;
        dsa?: number;
        resume?: number;
        communication?: number;
        projects?: number;
        behavioral?: number;
        overall?: number;
    };
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<CandidateMemoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Editable fields
    const [targetRole, setTargetRole] = useState('Full Stack Developer');
    const [targetCompanies, setTargetCompanies] = useState('Google, Amazon, Microsoft');
    const [targetDays, setTargetDays] = useState(21);
    const [newWeakTopic, setNewWeakTopic] = useState('');
    const [weakTopics, setWeakTopics] = useState<string[]>([]);

    useEffect(() => {
        const fetchMemory = async () => {
            try {
                setLoading(true);
                const res = await api.getCandidateMemory() as CandidateMemoryData;
                setProfile(res);
                if (res.targetRole) setTargetRole(res.targetRole);
                if (res.targetCompanies?.length) setTargetCompanies(res.targetCompanies.join(', '));
                if (res.targetDays) setTargetDays(res.targetDays);
                if (res.candidateMemory?.weakDSATopics) setWeakTopics(res.candidateMemory.weakDSATopics);
            } catch (err) {
                console.error('Failed to load profile memory:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMemory();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage('');
        try {
            const companiesList = targetCompanies.split(',').map(s => s.trim()).filter(Boolean);
            await api.updateCandidateMemory({
                targetRole,
                targetCompanies: companiesList,
                targetDays: Number(targetDays),
                candidateMemory: {
                    weakDSATopics: weakTopics,
                },
            });
            setSuccessMessage('AI Profile Memory updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3500);
        } catch (err) {
            console.error('Failed to save profile memory:', err);
        } finally {
            setSaving(false);
        }
    };

    const addWeakTopic = () => {
        if (newWeakTopic.trim() && !weakTopics.includes(newWeakTopic.trim())) {
            setWeakTopics([...weakTopics, newWeakTopic.trim()]);
            setNewWeakTopic('');
        }
    };

    const removeWeakTopic = (topic: string) => {
        setWeakTopics(weakTopics.filter(t => t !== topic));
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
                <div className="skeleton h-36 w-full rounded-3xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="skeleton h-64 rounded-3xl" />
                    <div className="skeleton h-64 rounded-3xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto animate-fade-in">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1432] via-[#0d1228] to-[#070914] border border-white/[0.08] p-7 lg:p-9 shadow-2xl backdrop-blur-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-indigo-500/25">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold mb-1">
                                <HiOutlineSparkles className="w-3 h-3" />
                                Candidate AI Memory Sync
                            </div>
                            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">{user?.name}</h1>
                            <p className="text-slate-400 text-xs">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.025] border border-white/[0.05]">
                        <span className="text-xs text-slate-400">Readiness:</span>
                        <span className="text-xl font-bold font-mono-metric text-emerald-400">
                            {profile?.readinessBreakdown?.overall || 65}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Form + Memory Diagnostics */}
            <form onSubmit={handleSave} className="space-y-6">
                <div className="glass-card rounded-3xl p-7 lg:p-8 space-y-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <HiOutlineBriefcase className="text-indigo-400" />
                        Target Career Parameters
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Target Role
                            </label>
                            <input
                                type="text"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. Full Stack Developer"
                                required
                                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Target Companies
                            </label>
                            <input
                                type="text"
                                value={targetCompanies}
                                onChange={(e) => setTargetCompanies(e.target.value)}
                                placeholder="Comma separated: Google, Amazon, TCS"
                                required
                                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Preparation Days Window
                            </label>
                            <input
                                type="number"
                                min={7}
                                max={60}
                                value={targetDays}
                                onChange={(e) => setTargetDays(Number(e.target.value))}
                                required
                                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-white text-xs font-mono-metric focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Persistent AI Memory Diagnostic State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Weak Topics Memory */}
                    <div className="glass-card rounded-3xl p-6 lg:p-7 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <HiOutlineCpuChip className="text-rose-400" />
                            AI Memory: Weak Topic Focus
                        </h3>
                        <p className="text-slate-400 text-xs">
                            Topics Gemini proactively introduces during technical simulations.
                        </p>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newWeakTopic}
                                onChange={(e) => setNewWeakTopic(e.target.value)}
                                placeholder="Add topic (e.g. Dynamic Programming, Graph Traversal)…"
                                className="flex-1 px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                            />
                            <button
                                type="button"
                                onClick={addWeakTopic}
                                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-indigo-300 text-xs font-semibold border border-white/[0.08] transition-colors"
                            >
                                Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {weakTopics.map((topic, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium"
                                >
                                    {topic}
                                    <button
                                        type="button"
                                        onClick={() => removeWeakTopic(topic)}
                                        className="hover:text-white font-bold ml-1"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* AI Speech & Behavioral Insights */}
                    <div className="glass-card rounded-3xl p-6 lg:p-7 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <HiOutlineChatBubbleBottomCenterText className="text-cyan-400" />
                            AI Memory: Speech &amp; Delivery Insights
                        </h3>
                        <p className="text-slate-400 text-xs">
                            Patterns captured across your completed interview sessions.
                        </p>

                        <div className="space-y-3">
                            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                                <span className="text-[11px] text-slate-400 font-semibold">Speech Pacing Average</span>
                                <p className="text-sm font-bold font-mono-metric text-white">
                                    {profile?.candidateMemory?.speechMetrics?.avgWpm || 135} <span className="text-xs font-normal text-slate-400">Words Per Minute (Optimal 120-150)</span>
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                                <span className="text-[11px] text-slate-400 font-semibold">Last Evaluator Feedback Memo</span>
                                <p className="text-xs text-slate-300 italic leading-relaxed">
                                    "{profile?.candidateMemory?.lastInterviewerFeedback || 'Strong architectural explanation. Continue emphasizing concrete metric impacts (e.g. latency, throughput) in STAR behavioral answers.'}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {successMessage && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 disabled:opacity-40 transition-all flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Updating Candidate Memory…
                            </>
                        ) : (
                            <>
                                <HiOutlineCheck className="w-4 h-4" />
                                Save &amp; Sync AI Profile
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
