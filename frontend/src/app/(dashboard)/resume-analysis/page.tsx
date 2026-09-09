'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '@/lib/api';
import ScoreCircle from '@/components/ScoreCircle';
import {
    HiOutlineCloudArrowUp,
    HiOutlineDocumentText,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineSparkles,
    HiOutlineCheck,
    HiOutlineLightBulb,
    HiOutlineArrowPath,
} from 'react-icons/hi2';

interface ResumeAnalysisData {
    candidate_profile: {
        primary_domain: string;
        experience_level: string;
        core_strength: string;
    };
    technical_skills: string[];
    mistakes_found: {
        mistake: string;
        why_its_wrong: string;
        how_to_correct: string;
    }[];
    perfect_score_roadmap: string[];
    score_breakdown: {
        technical_depth: number;
        impact: number;
        clarity: number;
        project_strength: number;
        industry_readiness: number;
        overall_score: number;
    };
    recommended_roles: string[];
    strengths: string[];
}

export default function ResumeAnalysisPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysis, setAnalysis] = useState<ResumeAnalysisData | null>(null);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError('');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
        maxFiles: 1,
    });

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('resume', file);

            const res = await api.request<{
                success: boolean;
                analysis: ResumeAnalysisData;
                resumeId: string;
            }>('/resume/analyze', {
                method: 'POST',
                body: formData,
                isFormData: true,
            });

            setAnalysis(res.analysis);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetAnalysis = () => {
        setFile(null);
        setAnalysis(null);
        setError('');
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1432] via-[#0d1228] to-[#070914] border border-white/[0.08] p-7 lg:p-9 shadow-2xl backdrop-blur-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide mb-3">
                        <HiOutlineSparkles className="w-3.5 h-3.5" />
                        AI ATS Parsing Engine
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                        Resume &amp; ATS Score Optimizer
                    </h1>
                    <p className="text-slate-300 text-xs lg:text-sm mt-1 max-w-2xl leading-relaxed">
                        Deep multi-dimensional analysis measuring technical depth, quantitative business impact, recruiter readability, and ATS machine-parser compatibility.
                    </p>
                </div>
            </div>

            {/* Upload Area or Results */}
            {!analysis ? (
                <div className="glass-card rounded-3xl p-8 lg:p-12 text-center max-w-3xl mx-auto space-y-6">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-3xl p-10 lg:p-14 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
                            isDragActive
                                ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                                : file
                                ? 'border-indigo-500/50 bg-indigo-950/20'
                                : 'border-white/[0.12] hover:border-indigo-500/40 hover:bg-white/[0.02]'
                        }`}
                    >
                        <input {...getInputProps()} />
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-400 shadow-lg shadow-indigo-500/10">
                            {file ? <HiOutlineDocumentText className="w-8 h-8" /> : <HiOutlineCloudArrowUp className="w-8 h-8" />}
                        </div>

                        {file ? (
                            <div className="space-y-1">
                                <p className="text-white font-semibold text-sm">{file.name}</p>
                                <p className="text-slate-400 text-xs font-mono-metric">{(file.size / 1024).toFixed(1)} KB • PDF Document</p>
                                <p className="text-indigo-400 text-xs font-medium pt-2">Click or drop another file to replace</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-white font-semibold text-base">Drop your PDF resume here, or <span className="text-indigo-400 underline underline-offset-4">browse</span></p>
                                <p className="text-slate-400 text-xs">Supports PDF format up to 10MB • ATS-compatible text extraction</p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-left flex items-start gap-2">
                            <span className="text-rose-400">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex justify-center pt-2">
                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Parsing &amp; Scoring Dimensions…
                                </>
                            ) : (
                                <>
                                    <HiOutlineSparkles className="w-4 h-4" />
                                    Analyze Resume with AI
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    {/* Top Action Bar */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">Analysis Completed for <span className="text-slate-200 font-semibold">{file?.name || 'Resume'}</span></span>
                        <button
                            onClick={resetAnalysis}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium border border-white/[0.08] transition-colors"
                        >
                            <HiOutlineArrowPath className="w-3.5 h-3.5" />
                            Upload Another Resume
                        </button>
                    </div>

                    {/* Overall Score + Candidate Profile Banner */}
                    <div className="glass-card rounded-3xl p-7 lg:p-9">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="space-y-3 flex-1 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                                    Domain: {analysis.candidate_profile?.primary_domain || 'Engineering'}
                                </div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    Candidate Profile &amp; Match Verdict
                                </h2>
                                <p className="text-slate-300 text-xs lg:text-sm leading-relaxed max-w-2xl">
                                    <strong className="text-indigo-300">Core Strength:</strong> {analysis.candidate_profile?.core_strength || 'Strong fundamental knowledge'}. Level assessed at <span className="font-semibold text-white">{analysis.candidate_profile?.experience_level || 'Entry-Level'}</span>.
                                </p>
                                {analysis.recommended_roles && analysis.recommended_roles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2 justify-center lg:justify-start">
                                        <span className="text-xs text-slate-400 font-medium self-center mr-1">Recommended Roles:</span>
                                        {analysis.recommended_roles.map((r, i) => (
                                            <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center shrink-0">
                                <ScoreCircle
                                    score={analysis.score_breakdown?.overall_score || 0}
                                    label="Overall ATS Score"
                                    size={125}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 5-Dimensional Breakdown */}
                    <div className="glass-card rounded-3xl p-6 lg:p-7">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                            <HiOutlineSparkles className="text-indigo-400" />
                            Multi-Dimensional Score Breakdown
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { label: 'Technical Depth', score: analysis.score_breakdown?.technical_depth || 0 },
                                { label: 'Actionable Impact', score: analysis.score_breakdown?.impact || 0 },
                                { label: 'Readability / Clarity', score: analysis.score_breakdown?.clarity || 0 },
                                { label: 'Project Strength', score: analysis.score_breakdown?.project_strength || 0 },
                                { label: 'ATS Readiness', score: analysis.score_breakdown?.industry_readiness || 0 },
                            ].map((dim) => (
                                <div key={dim.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center space-y-2">
                                    <div className="text-xl font-bold font-mono-metric text-white">{dim.score}%</div>
                                    <p className="text-[11px] text-slate-400 leading-tight">{dim.label}</p>
                                    <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                                        <div
                                            className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                                            style={{ width: `${dim.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Extracted Skills & Strengths */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Skills */}
                        <div className="glass-card rounded-3xl p-6">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <HiOutlineCheck className="text-emerald-400" />
                                Extracted Technical Skills ({analysis.technical_skills?.length || 0})
                            </h3>
                            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                                {analysis.technical_skills?.map((skill, i) => (
                                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-200 font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Identified Strengths */}
                        <div className="glass-card rounded-3xl p-6">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <HiOutlineCheckCircle className="text-cyan-400" />
                                Highlighted Strengths
                            </h3>
                            <div className="space-y-2.5">
                                {analysis.strengths?.map((s, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 text-xs text-emerald-200/90 flex items-start gap-2">
                                        <span className="text-emerald-400 mt-0.5">✓</span>
                                        <span>{s}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mistakes & Correction Suggestions */}
                    {analysis.mistakes_found && analysis.mistakes_found.length > 0 && (
                        <div className="glass-card rounded-3xl p-6 lg:p-7">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <HiOutlineXCircle className="text-rose-400" />
                                Detected Flaws &amp; How to Fix ({analysis.mistakes_found.length})
                            </h3>
                            <div className="space-y-3">
                                {analysis.mistakes_found.map((item, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-black/30 border border-white/[0.06] space-y-2">
                                        <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-[10px]">ISSUE</span>
                                            <span>{item.mistake}</span>
                                        </div>
                                        <p className="text-slate-300 text-xs"><strong className="text-slate-400">Why it hurts:</strong> {item.why_its_wrong}</p>
                                        <p className="text-emerald-300 text-xs bg-emerald-500/[0.06] p-2.5 rounded-xl border border-emerald-500/15">
                                            💡 <strong>Recommended Action:</strong> {item.how_to_correct}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Perfect Score Roadmap */}
                    {analysis.perfect_score_roadmap && analysis.perfect_score_roadmap.length > 0 && (
                        <div className="glass-card rounded-3xl p-6 lg:p-7">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <HiOutlineLightBulb className="text-amber-400" />
                                Actionable Checklist to Reach 95%+ ATS Score
                            </h3>
                            <div className="space-y-2">
                                {analysis.perfect_score_roadmap.map((step, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <p className="text-slate-300 text-xs leading-relaxed">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
