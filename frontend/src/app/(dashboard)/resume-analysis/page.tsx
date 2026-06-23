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
    HiOutlineArrowRight,
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

    const scoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Resume Analyzer</h1>
                <p className="text-gray-400">Upload your PDF resume to receive deep ATS grading, structure feedback, and concrete suggestions.</p>
            </div>

            {!analysis ? (
                <div className="glass-card rounded-2xl p-8 space-y-6">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                            isDragActive
                                ? 'border-violet-500 bg-violet-500/5'
                                : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                    >
                        <input {...getInputProps()} />
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
                            <HiOutlineCloudArrowUp className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-lg">
                                {file ? file.name : 'Drag & drop your resume here'}
                            </p>
                            <p className="text-gray-500 text-sm mt-1">Supports PDF format only (Max 5MB)</p>
                        </div>
                        {file && (
                            <span className="text-xs px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                                File selected successfully
                            </span>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                            <HiOutlineXCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analyzing Resume Content…
                            </>
                        ) : (
                            <>
                                <HiOutlineSparkles className="w-5 h-5" />
                                Start ATS Analysis
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    {/* Header score card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-cyan-600/20 border border-white/10 p-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left space-y-2">
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 font-medium">
                                    Analysis Complete
                                </span>
                                <h2 className="text-2xl font-bold text-white">
                                    Profile: <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">{analysis.candidate_profile.primary_domain}</span>
                                </h2>
                                <p className="text-gray-400 text-sm">Experience level: <span className="text-white font-medium">{analysis.candidate_profile.experience_level}</span></p>
                                <p className="text-gray-300 max-w-xl text-sm leading-relaxed mt-2">&ldquo;{analysis.candidate_profile.core_strength}&rdquo;</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <ScoreCircle score={analysis.score_breakdown.overall_score} label="Overall ATS" size={120} />
                            </div>
                        </div>
                    </div>

                    {/* Breakdown grids */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {[
                            { label: 'Technical Depth', score: analysis.score_breakdown.technical_depth },
                            { label: 'Impact & Metrics', score: analysis.score_breakdown.impact },
                            { label: 'Clarity & Quality', score: analysis.score_breakdown.clarity },
                            { label: 'Project Strength', score: analysis.score_breakdown.project_strength },
                            { label: 'Industry Ready', score: analysis.score_breakdown.industry_readiness },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card rounded-xl p-4 text-center">
                                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                                <p className={`text-2xl font-bold ${scoreColor(stat.score)}`}>{stat.score}%</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <div className="glass-card rounded-2xl p-6 space-y-4">
                            <h3 className="text-white font-bold text-lg border-b border-white/10 pb-3">Strengths &amp; Core Highlights</h3>
                            <div className="space-y-3">
                                {analysis.strengths.map((str, idx) => (
                                    <div key={idx} className="flex gap-3 items-start">
                                        <HiOutlineCheck className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-gray-300 text-sm leading-relaxed">{str}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommended Roles */}
                        <div className="glass-card rounded-2xl p-6 space-y-4">
                            <h3 className="text-white font-bold text-lg border-b border-white/10 pb-3 flex items-center gap-2">
                                <HiOutlineDocumentText className="w-5 h-5 text-violet-400" />
                                Recommended Roles
                            </h3>
                            <div className="space-y-2.5">
                                {analysis.recommended_roles.map((role, idx) => (
                                    <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/5 text-gray-300 hover:text-white text-sm font-medium transition-colors">
                                        <HiOutlineArrowRight className="w-4 h-4 text-violet-400" />
                                        {role}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="glass-card rounded-2xl p-6 space-y-3">
                        <h3 className="text-white font-bold text-lg">Detected Technical Skills</h3>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {analysis.technical_skills.map((skill, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Mistakes & Corrections */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-white/10 pb-4">
                            <HiOutlineXCircle className="w-7 h-7 text-red-400" />
                            Mistakes Found &amp; How to Correct Them
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {analysis.mistakes_found.map((item, idx) => (
                                <div key={idx} className="glass-card rounded-2xl overflow-hidden border border-red-500/20 relative">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500/50" />
                                    <div className="p-6 space-y-4 pl-8">
                                        <div>
                                            <h4 className="text-red-400 text-sm font-bold uppercase tracking-wider mb-1">Mistake Found</h4>
                                            <p className="text-white text-lg font-medium">{item.mistake}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <HiOutlineLightBulb className="w-4 h-4" />
                                                Why it's wrong
                                            </h4>
                                            <p className="text-gray-300 text-sm leading-relaxed">{item.why_its_wrong}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <HiOutlineCheckCircle className="w-4 h-4" />
                                                How to correct it
                                            </h4>
                                            <p className="text-emerald-50 font-medium text-sm leading-relaxed">{item.how_to_correct}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Perfect Score Roadmap */}
                    <div className="glass-card rounded-2xl p-8 space-y-6 border border-cyan-500/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3 relative z-10">
                            <HiOutlineSparkles className="w-7 h-7 text-cyan-400" />
                            Roadmap to a Perfect Score
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {analysis.perfect_score_roadmap.map((step, idx) => (
                                <div key={idx} className="flex gap-4 items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors">
                                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                                        {idx + 1}
                                    </span>
                                    <p className="text-cyan-50 text-base font-medium">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={resetAnalysis}
                        className="w-full py-4 rounded-xl border border-white/10 hover:bg-white/5 text-white font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        <HiOutlineArrowPath className="w-5 h-5" />
                        Analyze Another Resume
                    </button>
                </div>
            )}
        </div>
    );
}
