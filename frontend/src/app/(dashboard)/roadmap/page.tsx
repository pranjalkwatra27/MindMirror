'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    HiOutlineMap,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineSparkles,
    HiOutlineArrowPath,
    HiOutlineBuildingOffice2,
    HiOutlineAcademicCap,
    HiOutlinePlay,
    HiOutlineArrowTopRightOnSquare,
    HiOutlineCalendarDays,
    HiOutlineFire,
    HiOutlineCheck,
} from 'react-icons/hi2';

interface Resource {
    title: string;
    url: string;
    type?: string;
}

interface RoadmapDay {
    day: number;
    title: string;
    category: string;
    task: string;
    description: string;
    completed: boolean;
    resources: Resource[];
}

interface RoadmapData {
    roadmap: RoadmapDay[];
    targetCompany: string;
    targetRole: string;
    targetDays: number;
    stats: {
        totalDays: number;
        completedDays: number;
        progressPercentage: number;
    };
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    DSA: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    Technical: { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30' },
    'Project Deep Dive': { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
    'Mock Interview': { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
    Behavioral: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
    'System Design': { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
    'Resume Refinement': { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
};

export default function RoadmapPage() {
    const [data, setData] = useState<RoadmapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [filterCategory, setFilterCategory] = useState('All');

    // Config form states
    const [targetCompany, setTargetCompany] = useState('Google');
    const [targetRole, setTargetRole] = useState('Software Engineer');
    const [targetDays, setTargetDays] = useState(21);

    const fetchRoadmap = async () => {
        try {
            setLoading(true);
            const res = await api.getRoadmap() as RoadmapData;
            setData(res);
            if (res.targetCompany) setTargetCompany(res.targetCompany);
            if (res.targetRole) setTargetRole(res.targetRole);
            if (res.targetDays) setTargetDays(res.targetDays);
        } catch (err) {
            console.error('Failed to load roadmap:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoadmap();
    }, []);

    const handleToggleTask = async (day: number) => {
        if (!data) return;
        const updatedRoadmap = data.roadmap.map((d) =>
            d.day === day ? { ...d, completed: !d.completed } : d
        );
        const completedCount = updatedRoadmap.filter((d) => d.completed).length;
        const progressPercentage = Math.round((completedCount / updatedRoadmap.length) * 100);

        setData({
            ...data,
            roadmap: updatedRoadmap,
            stats: {
                totalDays: updatedRoadmap.length,
                completedDays: completedCount,
                progressPercentage,
            },
        });

        try {
            await api.toggleRoadmapTask(day);
        } catch (err) {
            console.error('Failed to toggle task:', err);
            fetchRoadmap();
        }
    };

    const handleGenerateNew = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsGenerating(true);
            await api.generateRoadmap({
                targetCompany,
                targetRole,
                targetDays: Number(targetDays),
            });
            setShowConfig(false);
            fetchRoadmap();
        } catch (err) {
            console.error('Failed to generate roadmap:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
                <div className="skeleton h-44 w-full rounded-3xl" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="skeleton h-24 rounded-2xl" />
                    <div className="skeleton h-24 rounded-2xl" />
                    <div className="skeleton h-24 rounded-2xl" />
                    <div className="skeleton h-24 rounded-2xl" />
                </div>
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-28 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    const categories = ['All', 'DSA', 'Technical', 'Mock Interview', 'Project Deep Dive', 'Behavioral', 'System Design'];
    const filteredRoadmap = data?.roadmap.filter((item) =>
        filterCategory === 'All' ? true : item.category === filterCategory
    ) || [];

    const stats = data?.stats || { totalDays: 21, completedDays: 0, progressPercentage: 0 };

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1432] via-[#0d1228] to-[#070914] border border-white/[0.08] p-7 lg:p-9 shadow-2xl backdrop-blur-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
                            <HiOutlineSparkles className="w-3.5 h-3.5" />
                            AI Adaptive Schedule
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                            Personalized Placement Roadmap
                        </h1>
                        <p className="text-slate-300 text-xs lg:text-sm max-w-2xl leading-relaxed">
                            Tailored day-by-day plan targeting <span className="text-indigo-300 font-semibold">{data?.targetCompany || 'Top Tech'}</span> as a <span className="text-cyan-300 font-semibold">{data?.targetRole || 'Software Engineer'}</span>.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all self-start md:self-auto shrink-0"
                    >
                        <HiOutlineArrowPath className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        Adapt &amp; Customize Plan
                    </button>
                </div>

                {/* Progress Overview Grid */}
                <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/[0.025] rounded-2xl p-4 border border-white/[0.05]">
                        <span className="text-[11px] text-slate-400 font-medium">Target Company</span>
                        <div className="flex items-center gap-2 mt-1">
                            <HiOutlineBuildingOffice2 className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm lg:text-base font-bold text-white truncate">{data?.targetCompany || 'Google'}</span>
                        </div>
                    </div>

                    <div className="bg-white/[0.025] rounded-2xl p-4 border border-white/[0.05]">
                        <span className="text-[11px] text-slate-400 font-medium">Timeline Window</span>
                        <div className="flex items-center gap-2 mt-1">
                            <HiOutlineCalendarDays className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm lg:text-base font-bold font-mono-metric text-white">{data?.targetDays || 21} Days</span>
                        </div>
                    </div>

                    <div className="bg-white/[0.025] rounded-2xl p-4 border border-white/[0.05]">
                        <span className="text-[11px] text-slate-400 font-medium">Milestones Completed</span>
                        <div className="flex items-center gap-2 mt-1">
                            <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm lg:text-base font-bold font-mono-metric text-white">{stats.completedDays} / {stats.totalDays}</span>
                        </div>
                    </div>

                    <div className="bg-white/[0.025] rounded-2xl p-4 border border-white/[0.05]">
                        <span className="text-[11px] text-slate-400 font-medium">Roadmap Progress</span>
                        <div className="flex items-center gap-2 mt-1">
                            <HiOutlineFire className="w-4 h-4 text-amber-400" />
                            <span className="text-sm lg:text-base font-bold font-mono-metric text-amber-400">{stats.progressPercentage}%</span>
                        </div>
                    </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="mt-4 w-full bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, stats.progressPercentage)}%` }}
                    />
                </div>
            </div>

            {/* Customization Drawer */}
            {showConfig && (
                <div className="glass-card rounded-3xl p-6 lg:p-7 animate-fade-in space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <HiOutlineSparkles className="text-indigo-400" />
                        Configure Target Placement Profile &amp; Window
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        Gemini will dynamically calibrate your daily tasks based on company-specific hiring criteria and days left.
                    </p>

                    <form onSubmit={handleGenerateNew} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Target Company
                            </label>
                            <input
                                type="text"
                                value={targetCompany}
                                onChange={(e) => setTargetCompany(e.target.value)}
                                placeholder="e.g. Google, Amazon, Microsoft, TCS"
                                required
                                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Target Role
                            </label>
                            <input
                                type="text"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. Full-Stack Engineer, SDE 1"
                                required
                                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Days Window (7 - 30)
                            </label>
                            <input
                                type="number"
                                min={7}
                                max={30}
                                value={targetDays}
                                onChange={(e) => setTargetDays(Number(e.target.value))}
                                required
                                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-white text-xs font-mono-metric focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="md:col-span-3 flex justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowConfig(false)}
                                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 disabled:opacity-40"
                            >
                                {isGenerating ? 'Synthesizing Roadmap…' : 'Generate Roadmap'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2">Filter:</span>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                            filterCategory === cat
                                ? 'bg-indigo-600/25 border border-indigo-500 text-white shadow-md'
                                : 'glass-card text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Day Cards Timeline */}
            <div className="space-y-3.5">
                {filteredRoadmap.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        <HiOutlineMap className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">No roadmap milestones found for "{filterCategory}".</p>
                    </div>
                ) : (
                    filteredRoadmap.map((item) => {
                        const style = categoryColors[item.category] || categoryColors.Technical;
                        return (
                            <div
                                key={item.day}
                                className={`rounded-2xl border transition-all p-5 lg:p-6 backdrop-blur-xl ${
                                    item.completed
                                        ? 'bg-[#090d20]/50 border-emerald-500/25 opacity-75'
                                        : 'glass-card'
                                }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        {/* Toggle Check Button */}
                                        <button
                                            onClick={() => handleToggleTask(item.day)}
                                            className={`mt-1 shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                                                item.completed
                                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                                    : 'bg-white/[0.04] border border-white/[0.15] text-transparent hover:border-indigo-400'
                                            }`}
                                            title={item.completed ? 'Mark as pending' : 'Mark as completed'}
                                        >
                                            <HiOutlineCheck className="w-4 h-4 stroke-[3]" />
                                        </button>

                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="px-2.5 py-0.5 rounded-md bg-white/[0.06] text-white font-mono-metric font-bold text-[11px]">
                                                    DAY {item.day}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                                                    {item.category}
                                                </span>
                                                {item.completed && (
                                                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                                        <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                                        Completed
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className={`text-sm lg:text-base font-bold ${item.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                                                {item.title}
                                            </h3>

                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                {item.task}
                                            </p>

                                            {item.description && (
                                                <p className="text-[11px] text-slate-400 italic bg-black/30 p-2 rounded-xl border border-white/[0.04] mt-1.5">
                                                    💡 {item.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action links */}
                                    <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.05]">
                                        {item.resources && item.resources.map((res, idx) => (
                                            <a
                                                key={idx}
                                                href={res.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-indigo-300 hover:text-indigo-200 text-xs font-medium border border-white/[0.06] transition-colors"
                                            >
                                                <span>{res.title}</span>
                                                <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
                                            </a>
                                        ))}

                                        {item.category === 'Mock Interview' && (
                                            <a
                                                href="/interview-simulator"
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-rose-500/20"
                                            >
                                                <HiOutlinePlay className="w-3 h-3 fill-white" />
                                                Start Simulation
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
