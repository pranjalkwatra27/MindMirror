'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    HiOutlineBuildingOffice2,
    HiOutlineSparkles,
    HiOutlineBriefcase,
    HiOutlineTrophy,
    HiOutlinePuzzlePiece,
    HiOutlineChatBubbleLeftRight,
    HiOutlineCheckBadge,
    HiOutlineTag,
    HiOutlinePlay,
    HiOutlineArrowPath,
} from 'react-icons/hi2';

interface CompanySummary {
    id: string;
    name: string;
    tier: string;
    logo: string;
    color: string;
    roles: string[];
}

interface InterviewRound {
    roundNumber: number;
    title: string;
    focus: string;
    duration: string;
    topics: string[];
}

interface DSAWeightage {
    topic: string;
    weightage: number;
    difficulty: string;
}

interface CuratedQuestion {
    type: string;
    question: string;
    importance: string;
    tips: string;
}

interface CompanyPack {
    company: string;
    role: string;
    difficultyLevel: string;
    hiringBarDescription: string;
    rounds: InterviewRound[];
    dsaTopicWeightage: DSAWeightage[];
    curatedQuestions: CuratedQuestion[];
    resumeKeywords: string[];
    culturePrinciples: string[];
}

export default function CompanyPrepPage() {
    const [companies, setCompanies] = useState<CompanySummary[]>([]);
    const [selectedCompany, setSelectedCompany] = useState('Google');
    const [selectedRole, setSelectedRole] = useState('Software Engineer');
    const [customCompany, setCustomCompany] = useState('');
    const [pack, setPack] = useState<CompanyPack | null>(null);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingPack, setLoadingPack] = useState(false);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const res = await api.getCompanyList() as { companies: CompanySummary[] };
                setCompanies(res.companies || []);
            } catch (err) {
                console.error('Failed to load companies:', err);
            } finally {
                setLoadingList(false);
            }
        };
        fetchList();
    }, []);

    const fetchPack = async (compName: string, roleName: string) => {
        try {
            setLoadingPack(true);
            const res = await api.getCompanyPack(compName, roleName) as { pack: CompanyPack };
            setPack(res.pack);
        } catch (err) {
            console.error('Failed to load company pack:', err);
        } finally {
            setLoadingPack(false);
        }
    };

    useEffect(() => {
        if (selectedCompany) {
            fetchPack(selectedCompany, selectedRole);
        }
    }, [selectedCompany, selectedRole]);

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customCompany.trim()) {
            setSelectedCompany(customCompany.trim());
            fetchPack(customCompany.trim(), selectedRole);
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1432] via-[#0d1228] to-[#070914] border border-white/[0.08] p-7 lg:p-9 shadow-2xl backdrop-blur-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
                        <HiOutlineBuildingOffice2 className="w-3.5 h-3.5" />
                        Targeted Placement Intelligence Packs
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                        Company-Specific Preparation Hub
                    </h1>
                    <p className="text-slate-300 text-xs lg:text-sm max-w-2xl leading-relaxed">
                        Round blueprints, most tested algorithmic patterns, ATS keywords, and cultural evaluation bars for top tier product and service employers.
                    </p>
                </div>
            </div>

            {/* Company Selection Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <HiOutlineBriefcase className="text-indigo-400" />
                        1. Select Target Company
                    </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {companies.map((c) => {
                        const isSelected = selectedCompany.toLowerCase() === c.name.toLowerCase() || selectedCompany.toLowerCase() === c.id.toLowerCase();
                        return (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCompany(c.name)}
                                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                                    isSelected
                                        ? 'bg-gradient-to-b from-indigo-950/70 to-indigo-900/30 border-indigo-500 shadow-lg shadow-indigo-500/15'
                                        : 'glass-card'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white font-black text-xs shadow-md`}>
                                        {c.logo}
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-md bg-white/[0.04]">
                                        {c.tier.includes('Product') ? 'Product' : 'Services'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xs lg:text-sm font-bold text-white truncate">{c.name}</h3>
                                    <p className="text-[11px] text-slate-400 truncate">{c.roles[0]}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Custom Search Box */}
                <form onSubmit={handleCustomSubmit} className="flex gap-2 max-w-lg pt-1">
                    <input
                        type="text"
                        value={customCompany}
                        onChange={(e) => setCustomCompany(e.target.value)}
                        placeholder="Search or enter any custom company (e.g. Netflix, Uber, Infosys)…"
                        className="flex-1 px-3.5 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shrink-0"
                    >
                        Generate Pack
                    </button>
                </form>
            </div>

            {/* Pack Intelligence Details */}
            {loadingPack ? (
                <div className="space-y-6">
                    <div className="skeleton h-32 w-full rounded-3xl" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="skeleton h-64 rounded-3xl" />
                        <div className="skeleton h-64 rounded-3xl" />
                    </div>
                </div>
            ) : pack ? (
                <div className="space-y-8 animate-fade-in">
                    {/* Overview Card */}
                    <div className="glass-card rounded-3xl p-7 lg:p-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl lg:text-3xl font-extrabold text-white">
                                        {pack.company}
                                    </h2>
                                    <span className="px-3 py-0.5 rounded-full text-xs font-bold font-mono-metric bg-amber-500/15 border border-amber-500/30 text-amber-300">
                                        Bar: {pack.difficultyLevel}
                                    </span>
                                </div>
                                <p className="text-xs lg:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                                    {pack.hiringBarDescription}
                                </p>
                            </div>

                            <a
                                href="/interview-simulator"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all shrink-0"
                            >
                                <HiOutlinePlay className="w-4 h-4 fill-white" />
                                Start {pack.company} Mock Simulation
                            </a>
                        </div>

                        {/* Culture Principles & Keywords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <HiOutlineCheckBadge className="text-emerald-400" />
                                    Core Cultural Values &amp; Evaluation Bar
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {pack.culturePrinciples.map((val, idx) => (
                                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                                            ✓ {val}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <HiOutlineTag className="text-cyan-400" />
                                    Target ATS Keywords for Resume Matching
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {pack.resumeKeywords.map((kw, idx) => (
                                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-cyan-500/[0.08] border border-cyan-500/20 text-cyan-300 text-xs font-medium">
                                            #{kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interview Rounds & DSA Weightage */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Interview Rounds Breakdown */}
                        <div className="glass-card rounded-3xl p-6 lg:p-7 space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <HiOutlineTrophy className="text-indigo-400" />
                                Standard Interview Rounds
                            </h3>

                            <div className="space-y-3">
                                {pack.rounds.map((round) => (
                                    <div
                                        key={round.roundNumber}
                                        className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] space-y-1.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                                                Round {round.roundNumber} • {round.duration}
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-medium">{round.focus}</span>
                                        </div>
                                        <h4 className="text-xs lg:text-sm font-bold text-white">{round.title}</h4>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {round.topics.map((top, idx) => (
                                                <span key={idx} className="px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 text-[10px]">
                                                    {top}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* DSA Topic Weightage Distribution */}
                        <div className="glass-card rounded-3xl p-6 lg:p-7 space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <HiOutlinePuzzlePiece className="text-cyan-400" />
                                DSA Topic Weightage &amp; Frequency
                            </h3>

                            <div className="space-y-3.5">
                                {pack.dsaTopicWeightage.map((item, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className="text-slate-200">{item.topic}</span>
                                            <span className="text-cyan-300 font-mono-metric">{item.weightage}% ({item.difficulty})</span>
                                        </div>
                                        <div className="w-full bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full"
                                                style={{ width: `${item.weightage * 2.5}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 p-3.5 rounded-2xl bg-indigo-500/[0.06] border border-indigo-500/15 text-indigo-200 text-xs leading-relaxed">
                                💡 <strong>Strategic Priority:</strong> Dedicate 60% of preparation to the top two weightage topics for this company before diversifying.
                            </div>
                        </div>
                    </div>

                    {/* Curated Frequently Asked Questions */}
                    <div className="glass-card rounded-3xl p-6 lg:p-7 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <HiOutlineChatBubbleLeftRight className="text-indigo-400" />
                            Curated {pack.company} Technical &amp; Behavioral Questions
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pack.curatedQuestions.map((q, idx) => (
                                <div
                                    key={idx}
                                    className="p-5 rounded-2xl bg-black/40 border border-white/[0.05] flex flex-col justify-between space-y-3"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                                                {q.type}
                                            </span>
                                            <span className="text-[10px] text-amber-300 font-semibold">
                                                ★ {q.importance} Priority
                                            </span>
                                        </div>
                                        <p className="text-xs lg:text-sm font-medium text-slate-100 leading-relaxed">
                                            "{q.question}"
                                        </p>
                                    </div>

                                    {q.tips && (
                                        <p className="text-xs text-slate-400 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04] italic leading-relaxed">
                                            💡 <strong className="text-slate-300">Interviewer Expectation:</strong> {q.tips}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
