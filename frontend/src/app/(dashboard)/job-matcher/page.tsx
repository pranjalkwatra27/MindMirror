'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '@/lib/api';
import ScoreCircle from '@/components/ScoreCircle';
import {
    HiOutlineCloudArrowUp,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineSparkles,
    HiOutlineLightBulb,
    HiOutlineArrowPath,
    HiOutlineBriefcase,
    HiOutlineAcademicCap,
    HiOutlinePlay,
    HiOutlineCheckBadge,
    HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2';

interface QuizQuestion {
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
    topic: string;
}

interface MatchRecommendation {
    skill: string;
    recommendation: string;
    platform: string;
    link: string;
}

interface JobMatchData {
    match_score: number;
    breakdown: {
        skills_match: number;
        experience_match: number;
        formatting_score: number;
    };
    matching_skills: string[];
    missing_skills: string[];
    recommended_resources: MatchRecommendation[];
    quiz: QuizQuestion[];
}

export default function JobMatcherPage() {
    // Input state
    const [file, setFile] = useState<File | null>(null);
    const [useLatestResume, setUseLatestResume] = useState(true);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [matchData, setMatchData] = useState<JobMatchData | null>(null);

    // Quiz state
    const [quizMode, setQuizMode] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    // Dropzone configuration
    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setUseLatestResume(false);
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

    const handleMatch = async () => {
        if (!jobDescription.trim()) {
            setError('Please enter a Job Description.');
            return;
        }
        if (!useLatestResume && !file) {
            setError('Please upload a resume or choose to use your latest uploaded resume.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('jobDescription', jobDescription);
            if (file) {
                formData.append('resume', file);
            }

            const res = await api.request<{
                success: boolean;
                match: JobMatchData;
            }>('/resume/compare-job', {
                method: 'POST',
                body: file ? formData : { jobDescription },
                isFormData: !!file,
            });

            setMatchData(res.match);
            // Reset quiz states
            setQuizMode(false);
            setCurrentQuestionIndex(0);
            setSelectedAnswers({});
            setQuizSubmitted(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to perform ATS job match. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetMatcher = () => {
        setFile(null);
        setUseLatestResume(true);
        setJobDescription('');
        setMatchData(null);
        setError('');
        setQuizMode(false);
    };

    // Quiz Helper functions
    const handleSelectOption = (optionIdx: number) => {
        if (quizSubmitted) return;
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestionIndex]: optionIdx,
        });
    };

    const calculateQuizScore = () => {
        if (!matchData) return 0;
        let score = 0;
        matchData.quiz.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correct_answer) {
                score++;
            }
        });
        return score;
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1432] via-[#0d1228] to-[#070914] border border-white/[0.08] p-7 lg:p-9 shadow-2xl backdrop-blur-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide mb-3">
                        <HiOutlineBriefcase className="w-3.5 h-3.5" />
                        JD Alignment &amp; Skill Gap Engine
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                        Job Matcher &amp; Skills Gap Analyzer
                    </h1>
                    <p className="text-slate-300 text-xs lg:text-sm mt-1 max-w-2xl leading-relaxed">
                        Evaluate your candidate profile against any target job opening. Check match percentage, identify missing competencies, generate targeted MCQs, and access direct learning resources.
                    </p>
                </div>
            </div>

            {/* Inputs view */}
            {!matchData && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Resume Selection */}
                        <div className="glass-card rounded-3xl p-6 lg:p-7 space-y-4 flex flex-col justify-between">
                            <div>
                                <h3 className="text-white font-bold text-base mb-1">1. Candidate Resume Source</h3>
                                <p className="text-slate-400 text-xs mb-4">Choose whether to compare your existing profile resume or drop a customized PDF.</p>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => { setUseLatestResume(true); setFile(null); }}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                                            useLatestResume
                                                ? 'bg-indigo-600/25 border-indigo-500/50 text-white shadow-md'
                                                : 'border-white/[0.08] text-slate-400 hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        Active Profile Resume
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUseLatestResume(false)}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                                            !useLatestResume
                                                ? 'bg-indigo-600/25 border-indigo-500/50 text-white shadow-md'
                                                : 'border-white/[0.08] text-slate-400 hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        Upload Custom PDF
                                    </button>
                                </div>
                            </div>

                            {!useLatestResume && (
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                                        isDragActive
                                            ? 'border-indigo-400 bg-indigo-500/10'
                                            : 'border-white/[0.12] hover:border-indigo-500/40 bg-white/[0.02]'
                                    }`}
                                >
                                    <input {...getInputProps()} />
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                                        <HiOutlineCloudArrowUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-xs">
                                            {file ? file.name : 'Click or drop custom resume PDF'}
                                        </p>
                                        <p className="text-slate-400 text-[10px] mt-0.5 font-mono-metric">PDF up to 10MB</p>
                                    </div>
                                    {file && (
                                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                            File attached
                                        </span>
                                    )}
                                </div>
                            )}

                            {useLatestResume && (
                                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center text-center gap-2">
                                    <HiOutlineCheckBadge className="w-9 h-9 text-emerald-400" />
                                    <p className="text-slate-200 text-xs font-semibold">Using Default Profile Resume</p>
                                    <p className="text-slate-400 text-[11px]">Syncs directly with candidate profile database.</p>
                                </div>
                            )}
                        </div>

                        {/* Job Description Selection */}
                        <div className="glass-card rounded-3xl p-6 lg:p-7 space-y-3 flex flex-col">
                            <h3 className="text-white font-bold text-base mb-0.5">2. Target Job Description</h3>
                            <p className="text-slate-400 text-xs mb-1">Paste the full job opening requirements, responsibilities, and qualifications.</p>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste job description here (e.g. We are looking for a Full-Stack Engineer with React, Node.js, PostgreSQL, Docker, and AWS experience...)"
                                className="flex-1 w-full min-h-[170px] p-4 rounded-2xl bg-black/40 border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs leading-relaxed resize-none transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex justify-center">
                        <button
                            onClick={handleMatch}
                            disabled={loading}
                            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Comparing Skills &amp; Generating Gap Report…
                                </>
                            ) : (
                                <>
                                    <HiOutlineSparkles className="w-4 h-4" />
                                    Analyze Job Fit &amp; ATS Match
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Results view (Dashboard & Recommendations) */}
            {matchData && !quizMode && (
                <div className="space-y-8 animate-fade-in">
                    {/* Top action bar */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">ATS Match Verdict</span>
                        <button
                            onClick={resetMatcher}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium border border-white/[0.08] transition-colors"
                        >
                            <HiOutlineArrowPath className="w-3.5 h-3.5" />
                            Compare Another Job
                        </button>
                    </div>

                    {/* ATS Matching Banner */}
                    <div className="glass-card rounded-3xl p-7 lg:p-9">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="space-y-3 flex-1 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                                    Target Role Alignment
                                </div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    Overall Resume-to-Job Fit
                                </h2>
                                <p className="text-slate-300 text-xs lg:text-sm leading-relaxed max-w-2xl">
                                    Skills, experience seniority, and semantic keyword density have been mapped against the job description requirements.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center shrink-0">
                                <ScoreCircle score={matchData.match_score} label="Match Score" size={125} />
                            </div>
                        </div>
                    </div>

                    {/* Score Breakdown Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Skills Alignment', score: matchData.breakdown.skills_match, color: 'text-indigo-400' },
                            { label: 'Experience Match', score: matchData.breakdown.experience_match, color: 'text-cyan-400' },
                            { label: 'ATS Keyword Match', score: matchData.breakdown.formatting_score, color: 'text-emerald-400' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card rounded-2xl p-5 text-center space-y-1.5">
                                <p className="text-xs text-slate-400">{stat.label}</p>
                                <p className={`text-2xl font-bold font-mono-metric ${stat.color}`}>{stat.score}%</p>
                                <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                                    <div
                                        className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                                        style={{ width: `${stat.score}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Interactive quiz call-to-action */}
                    {matchData.quiz && matchData.quiz.length > 0 && (
                        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-[#0f1738] to-[#0a1026] border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h4 className="text-white font-bold text-sm lg:text-base flex items-center gap-2">
                                    <HiOutlineSparkles className="text-cyan-400" />
                                    AI Knowledge Gap Assessment ({matchData.quiz.length} Questions)
                                </h4>
                                <p className="text-slate-300 text-xs leading-relaxed max-w-xl">
                                    We synthesized a focused MCQ check for the {matchData.missing_skills.length} skills missing from your resume to verify your actual capability.
                                </p>
                            </div>
                            <button
                                onClick={() => setQuizMode(true)}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 shrink-0"
                            >
                                <HiOutlinePlay className="w-4 h-4 fill-white" />
                                Take Skills Gap Test
                            </button>
                        </div>
                    )}

                    {/* Skill Comparison Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Matching Skills */}
                        <div className="glass-card rounded-3xl p-6">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <HiOutlineCheckCircle className="text-emerald-400" />
                                Matching Skills ({matchData.matching_skills.length})
                            </h3>
                            {matchData.matching_skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {matchData.matching_skills.map((skill, idx) => (
                                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                                            ✓ {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-xs">No direct skill matches found. Add core technical keywords from the job description.</p>
                            )}
                        </div>

                        {/* Missing Skills */}
                        <div className="glass-card rounded-3xl p-6">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <HiOutlineXCircle className="text-rose-400" />
                                Missing Skills Gap ({matchData.missing_skills.length})
                            </h3>
                            {matchData.missing_skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {matchData.missing_skills.map((skill, idx) => (
                                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-500/[0.08] border border-rose-500/20 text-rose-300 text-xs font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-emerald-400 text-xs font-semibold">Outstanding fit! No major technical skill gaps detected.</p>
                            )}
                        </div>
                    </div>

                    {/* Learning & Certifications Recommendations */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <HiOutlineAcademicCap className="text-indigo-400" />
                            Curated Courses &amp; Certifications to Bridge Gaps
                        </h3>
                        {matchData.recommended_resources && matchData.recommended_resources.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {matchData.recommended_resources.map((rec, idx) => (
                                    <div key={idx} className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-3">
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-semibold">
                                                Gap: {rec.skill}
                                            </span>
                                            <h4 className="text-white font-bold text-sm">
                                                {rec.recommendation}
                                            </h4>
                                            <p className="text-slate-400 text-xs">Platform: <span className="text-slate-200 font-medium">{rec.platform}</span></p>
                                        </div>
                                        <div className="pt-2 border-t border-white/[0.05]">
                                            <a
                                                href={rec.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                                            >
                                                <span>Open Course</span>
                                                <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-xs">No learning resources required for this match.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Quiz Mode UI */}
            {matchData && quizMode && (
                <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-6 max-w-3xl mx-auto animate-fade-in">
                    {!quizSubmitted ? (
                        <>
                            {/* Header progress */}
                            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                                <div>
                                    <span className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider">Skills Gap Check</span>
                                    <h2 className="text-base lg:text-lg font-bold text-white mt-0.5">
                                        Question {currentQuestionIndex + 1} of {matchData.quiz.length}
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300 font-semibold">
                                        {matchData.quiz[currentQuestionIndex].topic}
                                    </span>
                                </div>
                            </div>

                            {/* Question description */}
                            <div className="py-2">
                                <p className="text-white text-sm lg:text-base font-medium leading-relaxed">
                                    {matchData.quiz[currentQuestionIndex].question}
                                </p>
                            </div>

                            {/* MCQ Options */}
                            <div className="space-y-2.5">
                                {matchData.quiz[currentQuestionIndex].options.map((option, idx) => {
                                    const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectOption(idx)}
                                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                                                isSelected
                                                    ? 'bg-indigo-600/25 border-indigo-500/50 text-white shadow-md'
                                                    : 'bg-white/[0.025] border-white/[0.06] text-slate-300 hover:bg-white/[0.05] hover:text-white'
                                            }`}
                                        >
                                            <span className="text-xs font-medium">{option}</span>
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                                isSelected ? 'border-indigo-400 bg-indigo-400' : 'border-slate-500'
                                            }`}>
                                                {isSelected && <div className="w-2 h-2 rounded-full bg-gray-900" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Navigation controls */}
                            <div className="flex justify-between items-center pt-4 border-t border-white/[0.08]">
                                <button
                                    disabled={currentQuestionIndex === 0}
                                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                                    className="px-4 py-2 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] text-slate-300 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>

                                {currentQuestionIndex < matchData.quiz.length - 1 ? (
                                    <button
                                        disabled={selectedAnswers[currentQuestionIndex] === undefined}
                                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next Question
                                    </button>
                                ) : (
                                    <button
                                        disabled={Object.keys(selectedAnswers).length < matchData.quiz.length}
                                        onClick={() => setQuizSubmitted(true)}
                                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        Submit Assessment
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        // Quiz Results UI
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center space-y-2 pb-5 border-b border-white/[0.08]">
                                <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Assessment Results</span>
                                <div className="flex justify-center my-3">
                                    <div className="px-6 py-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-center">
                                        <p className="text-2xl font-extrabold font-mono-metric text-white">{calculateQuizScore()} / {matchData.quiz.length}</p>
                                        <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Questions Correct</p>
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-white">Skills Gap Assessment Breakdown</h2>
                            </div>

                            {/* Detailed answers breakdown */}
                            <div className="space-y-3">
                                {matchData.quiz.map((q, idx) => {
                                    const userAns = selectedAnswers[idx];
                                    const isCorrect = userAns === q.correct_answer;
                                    return (
                                        <div key={idx} className={`p-4 rounded-2xl border ${
                                            isCorrect ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-rose-500/[0.04] border-rose-500/20'
                                        } space-y-2`}>
                                            <div className="flex justify-between items-start gap-3">
                                                <h4 className="text-white font-semibold text-xs leading-relaxed">
                                                    Q{idx + 1}: {q.question}
                                                </h4>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                                                    isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                                }`}>
                                                    {isCorrect ? 'Correct' : 'Incorrect'}
                                                </span>
                                            </div>
                                            <div className="text-xs space-y-0.5">
                                                <p className="text-slate-400">Your Choice: <span className={isCorrect ? 'text-emerald-300 font-medium' : 'text-rose-300 font-medium'}>{userAns !== undefined ? q.options[userAns] : 'Unanswered'}</span></p>
                                                {!isCorrect && (
                                                    <p className="text-emerald-300">Correct Answer: <span className="font-medium">{q.options[q.correct_answer]}</span></p>
                                                )}
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.05] space-y-1">
                                                <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <HiOutlineLightBulb className="w-3 h-3" />
                                                    Explanation ({q.topic})
                                                </div>
                                                <p className="text-slate-300 text-xs leading-relaxed">{q.explanation}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Back/Close buttons */}
                            <div className="flex gap-3 pt-3 border-t border-white/[0.08]">
                                <button
                                    onClick={() => setQuizMode(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
                                >
                                    Return to Job Match Report
                                </button>
                                <button
                                    onClick={resetMatcher}
                                    className="flex-1 py-2.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] text-slate-300 text-xs font-semibold transition-all"
                                >
                                    Compare New Job
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
