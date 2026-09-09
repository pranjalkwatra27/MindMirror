'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { analyzeText, AnalysisResult } from '@/lib/nlpAnalysis';
import ScoreCircle from '@/components/ScoreCircle';
import {
    HiOutlinePlay,
    HiOutlineArrowRight,
    HiOutlineCheckCircle,
    HiOutlineSparkles,
    HiOutlineChatBubbleLeftRight,
    HiOutlineMicrophone,
    HiOutlineStop,
    HiOutlineArrowPath,
    HiOutlineLightBulb,
    HiOutlineShieldCheck,
} from 'react-icons/hi2';

interface Question {
    question: string;
    category: string;
    difficulty: string;
    expectedKeyPoints?: string[];
    tips?: string[];
}

interface STARDimensions {
    relevance: number;
    structure: number;
    technicalDepth: number;
    confidence: number;
    conciseness: number;
}

interface STARChecklist {
    answeredQuestion: boolean;
    gaveConcreteExample: boolean;
    explainedReasoning: boolean;
    mentionedMeasurableImpact: boolean;
    structuredWell: boolean;
}

interface Evaluation {
    score: number;
    feedback: string;
    dimensions?: STARDimensions;
    starChecklist?: STARChecklist;
    idealAnswerSnippet?: string;
    strengths?: string[];
    areasForImprovement?: string[];
    suggestions?: string[];
    keyPointsMissed?: string[];
}

interface VoiceAnalysis {
    scores: {
        confidence_score: number;
        clarity_score: number;
        overall_score: number;
    };
    filler_analysis: {
        total_filler_words: number;
        filler_percentage: string;
        breakdown: { word: string; count: number }[];
    };
    speech_speed: {
        words_per_minute: number;
        pace: string;
        score: number;
    };
    sentiment_analysis: {
        confidence_score: number;
        label: string;
    };
    suggestions: string[];
}

interface AnswerResult {
    questionIndex: number;
    question: string;
    answer: string;
    evaluation: Evaluation | null;
    nlpAnalysis: AnalysisResult;
    voiceAnalysis?: VoiceAnalysis;
    wasVoiceRecorded: boolean;
}

const MODES = [
    { id: 'Technical', label: 'Technical Depth', desc: 'Framework internals, DB design, systems, architecture', icon: '💻', badge: 'Core' },
    { id: 'Behavioral', label: 'Behavioral (STAR)', desc: 'Conflict resolution, leadership, failure & impact stories', icon: '🧠', badge: 'STAR' },
    { id: 'Rapid-Fire-DSA', label: 'Rapid-Fire DSA', desc: 'Quick complexity analysis, data structure trade-offs', icon: '⚡', badge: 'Fast' },
    { id: 'HR', label: 'HR & Cultural Fit', desc: 'Communication, career goals, team dynamics', icon: '💬', badge: 'Fit' },
];

const ROLES = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Software Engineer',
    'Data Engineer',
    'DevOps Engineer',
    'AI/ML Engineer',
    'Mobile Developer',
];

export default function InterviewSimulatorPage() {
    const [mode, setMode] = useState('Technical');
    const [role, setRole] = useState('Full Stack Developer');
    const [step, setStep] = useState<'setup' | 'interview' | 'results'>('setup');
    const [interviewId, setInterviewId] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [answer, setAnswer] = useState('');
    const [results, setResults] = useState<AnswerResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [wasVoice, setWasVoice] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const recordingStartRef = useRef<number>(0);
    const finalTranscriptRef = useRef<string>('');

    useEffect(() => {
        const SR =
            (window as unknown as Record<string, unknown>).SpeechRecognition ||
            (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
        setVoiceSupported(!!SR);
    }, []);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        };
    }, []);

    const startRecording = () => {
        const SR =
            ((window as unknown as Record<string, unknown>).SpeechRecognition ||
            (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as typeof SpeechRecognition;
        if (!SR) return;

        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        finalTranscriptRef.current = answer;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + t;
                } else {
                    interim += t;
                }
            }
            setAnswer(finalTranscriptRef.current + (interim ? ' ' + interim : ''));
        };

        recognition.onerror = () => stopRecording();
        recognition.onend = () => {
            setIsRecording(false);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
        setWasVoice(true);
        recordingStartRef.current = Date.now();
        setRecordingDuration(0);
        recordingTimerRef.current = setInterval(() => {
            setRecordingDuration(Math.floor((Date.now() - recordingStartRef.current) / 1000));
        }, 1000);
    };

    const stopRecording = () => {
        if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
        setIsRecording(false);
        if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    };

    const startInterview = async () => {
        if (!mode || !role) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.startInterview(mode, role) as { interviewId: string; questions: Question[] };
            setInterviewId(res.interviewId);
            setQuestions(res.questions);
            setCurrentQ(0);
            setResults([]);
            setAnswer('');
            setWasVoice(false);
            setStep('interview');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start interview');
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!answer.trim()) return;
        if (isRecording) stopRecording();
        setSubmitting(true);

        const spokenDuration = wasVoice
            ? Math.max(1, Math.floor((Date.now() - recordingStartRef.current) / 1000))
            : Math.max(1, Math.round(answer.split(/\s+/).filter(Boolean).length / 2.2));

        const nlpResult = analyzeText(answer);
        let evaluation: Evaluation | null = null;
        let voiceAnalysis: VoiceAnalysis | undefined;

        try {
            const res = await api.submitAnswer(interviewId, currentQ, answer) as { evaluation: Evaluation };
            evaluation = res.evaluation;
        } catch (err) { console.error('Evaluation error:', err); }

        try {
            const apiExt = api as unknown as {
                analyzeVoiceTranscript: (t: string, d: number, id?: string) => Promise<{ analysis: VoiceAnalysis }>;
            };
            const voiceRes = await apiExt.analyzeVoiceTranscript(answer, spokenDuration, interviewId);
            voiceAnalysis = voiceRes.analysis;
        } catch (err) { console.error('Voice analysis error:', err); }

        setResults(prev => [...prev, {
            questionIndex: currentQ,
            question: questions[currentQ].question,
            answer,
            evaluation,
            nlpAnalysis: nlpResult,
            voiceAnalysis,
            wasVoiceRecorded: wasVoice,
        }]);

        setAnswer('');
        finalTranscriptRef.current = '';
        setWasVoice(false);
        setRecordingDuration(0);
        setSubmitting(false);

        if (currentQ < questions.length - 1) {
            setCurrentQ(prev => prev + 1);
        } else {
            try { await api.completeInterview(interviewId); } catch { }
            setStep('results');
        }
    };

    const getOverallScores = () => {
        if (!results.length) return { avgConfidence: 0, avgClarity: 0, avgTechnical: 0, avgVoice: 0 };
        const avg = (fn: (r: AnswerResult) => number) =>
            Math.round(results.reduce((s, r) => s + fn(r), 0) / results.length);
        const vr = results.filter(r => r.voiceAnalysis);
        return {
            avgConfidence: avg(r => r.nlpAnalysis.confidenceScore),
            avgClarity: avg(r => r.nlpAnalysis.clarityScore),
            avgTechnical: avg(r => r.evaluation?.score || 0),
            avgVoice: vr.length
                ? Math.round(vr.reduce((s, r) => s + Number(r.voiceAnalysis!.scores.overall_score), 0) / vr.length)
                : 0,
        };
    };

    const diffColor = (d: string) =>
        d === 'Easy' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' :
        d === 'Medium' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25' :
        d === 'Hard' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25' : 'bg-slate-500/15 text-slate-300 border border-slate-500/25';

    const fmtTime = (s: number) =>
        `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // ── STEP 1: SETUP ─────────────────────────────────────────────────────────
    if (step === 'setup') {
        return (
            <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1432] via-[#0d1228] to-[#070914] border border-white/[0.08] p-7 lg:p-9 shadow-2xl backdrop-blur-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide mb-3">
                            <HiOutlineSparkles className="w-3.5 h-3.5" />
                            Multi-Dimensional AI Simulation
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                            AI Mock Interview Simulator
                        </h1>
                        <p className="text-slate-300 text-xs lg:text-sm mt-1 max-w-2xl leading-relaxed">
                            Simulate real engineering interviews with conversational follow-up questions, multi-dimensional STAR scoring, speech pacing analysis, and instant feedback.
                        </p>
                    </div>
                </div>

                {/* Mode Selection */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">1. Select Interview Mode</h2>
                        <span className="text-xs text-indigo-400">Contextual STAR &amp; Tech Evaluation</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {MODES.map((m) => {
                            const isSelected = mode === m.id;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => setMode(m.id)}
                                    className={`p-5 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between space-y-3 ${
                                        isSelected
                                            ? 'bg-gradient-to-b from-indigo-950/70 to-indigo-900/30 border-indigo-500 shadow-lg shadow-indigo-500/15'
                                            : 'glass-card'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="text-2xl">{m.icon}</span>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                            isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/[0.06] text-slate-400'
                                        }`}>
                                            {m.badge}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm mb-1">{m.label}</h3>
                                        <p className="text-slate-400 text-xs leading-relaxed">{m.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Target Role */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">2. Select Target Engineering Role</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ROLES.map((r) => {
                            const isSelected = role === r;
                            return (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`p-3.5 rounded-xl text-xs font-semibold transition-all border text-center ${
                                        isSelected
                                            ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md'
                                            : 'glass-card text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    {r}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                        {error}
                    </div>
                )}

                <div className="flex justify-center pt-2">
                    <button
                        onClick={startInterview}
                        disabled={!mode || !role || loading}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Synthesizing Interview Questions…
                            </>
                        ) : (
                            <>
                                <HiOutlinePlay className="w-4 h-4" />
                                Launch AI Interview Session
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // ── STEP 2: LIVE INTERVIEW ────────────────────────────────────────────────
    if (step === 'interview') {
        const question = questions[currentQ];
        return (
            <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
                {/* Status Bar */}
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider">{mode} Round • {role}</span>
                        <h2 className="text-base lg:text-lg font-bold text-white mt-0.5">
                            Question {currentQ + 1} of {questions.length}
                        </h2>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {questions.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                    i < currentQ ? 'bg-emerald-400' : i === currentQ ? 'bg-indigo-400 animate-pulse scale-125' : 'bg-white/[0.12]'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Question Panel */}
                <div className="glass-card rounded-3xl p-7 lg:p-8 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 shadow-md">
                            <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                {question?.category && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-slate-300 font-semibold">
                                        {question.category}
                                    </span>
                                )}
                                {question?.difficulty && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${diffColor(question.difficulty)}`}>
                                        {question.difficulty}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-base lg:text-lg text-white font-semibold leading-relaxed">
                                {question?.question}
                            </h3>
                        </div>
                    </div>

                    {question?.tips && question.tips.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-indigo-500/[0.06] border border-indigo-500/15 space-y-1">
                            <p className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1">
                                <HiOutlineLightBulb className="w-3.5 h-3.5" />
                                Interviewer Focus Tip
                            </p>
                            <ul className="space-y-0.5 text-slate-300 text-xs pl-4 list-disc">
                                {question.tips.map((tip, i) => (
                                    <li key={i}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Textarea + Voice UI */}
                    <div className="relative">
                        <textarea
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            placeholder={isRecording ? '🎤 Listening carefully… speak your explanation clearly' : 'Type your answer here, or click "Record Voice Answer" to speak…'}
                            rows={7}
                            className={`w-full p-4 rounded-2xl bg-black/40 border text-slate-100 placeholder-slate-500 focus:outline-none text-xs lg:text-sm leading-relaxed resize-none transition-all ${
                                isRecording
                                    ? 'border-rose-500/60 focus:border-rose-500'
                                    : 'border-white/[0.08] focus:border-indigo-500'
                            }`}
                        />
                        {isRecording && (
                            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 backdrop-blur-md">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-rose-300 text-xs font-mono-metric">{fmtTime(recordingDuration)}</span>
                            </div>
                        )}
                    </div>

                    {/* Action controls */}
                    <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
                        <div className="flex items-center gap-3">
                            {voiceSupported && (
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    type="button"
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all border ${
                                        isRecording
                                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                                            : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                                    }`}
                                >
                                    {isRecording ? <><HiOutlineStop className="w-4 h-4" />Stop Recording</> : <><HiOutlineMicrophone className="w-4 h-4" />Record Voice Answer</>}
                                </button>
                            )}
                            <span className="text-[11px] text-slate-400 font-mono-metric">
                                {answer.split(/\s+/).filter(Boolean).length} words
                                {wasVoice && !isRecording && <span className="ml-2 text-rose-400 font-medium">🎤 Voice Mode</span>}
                            </span>
                        </div>

                        <button
                            onClick={submitAnswer}
                            disabled={!answer.trim() || submitting}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Evaluating STAR Dimensions…
                                </>
                            ) : currentQ < questions.length - 1 ? (
                                <>
                                    Submit Answer &amp; Continue
                                    <HiOutlineArrowRight className="w-3.5 h-3.5" />
                                </>
                            ) : (
                                <>
                                    Submit Final &amp; View Report
                                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Live Analysis Preview */}
                {answer.trim().length > 10 && (
                    <div className="glass-card rounded-2xl p-4 animate-fade-in">
                        <p className="text-[11px] text-slate-400 mb-2 flex items-center gap-1.5 font-semibold">
                            <HiOutlineSparkles className="w-3.5 h-3.5 text-indigo-400" />
                            Live Delivery Metrics
                        </p>
                        {(() => {
                            const live = analyzeText(answer);
                            return (
                                <div className="flex items-center gap-6 flex-wrap text-xs">
                                    <div><span className="text-white font-bold font-mono-metric">{live.confidenceScore}%</span><span className="text-slate-400 ml-1.5">Confidence</span></div>
                                    <div className="w-px h-4 bg-white/[0.08]" />
                                    <div><span className="text-white font-bold font-mono-metric">{live.clarityScore}%</span><span className="text-slate-400 ml-1.5">Clarity</span></div>
                                    <div className="w-px h-4 bg-white/[0.08]" />
                                    <div><span className="text-white font-bold font-mono-metric">{live.fillerWordCount}</span><span className="text-slate-400 ml-1.5">Filler Words</span></div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        );
    }

    // ── STEP 3: RESULTS & REPORT ──────────────────────────────────────────────
    const { avgConfidence, avgClarity, avgTechnical, avgVoice } = getOverallScores();
    const hasVoiceData = results.some(r => r.voiceAnalysis);

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                        Simulation Completed
                    </span>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
                        Mock Interview Performance Report
                    </h1>
                    <p className="text-slate-400 text-xs mt-0.5">
                        {mode} Round • {role} • {results.length} questions evaluated
                    </p>
                </div>

                <button
                    onClick={() => { setStep('setup'); setResults([]); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all self-start sm:self-auto"
                >
                    <HiOutlineArrowPath className="w-4 h-4" />
                    Start New Simulation
                </button>
            </div>

            {/* Overall Score Rings */}
            <div className="glass-card rounded-3xl p-7 lg:p-9">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-6">
                    Multi-Dimensional Performance Aggregate
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                    <ScoreCircle score={avgConfidence} label="Confidence" size={110} color="#6366f1" />
                    <ScoreCircle score={avgClarity} label="Clarity" size={110} color="#38bdf8" />
                    <ScoreCircle score={avgTechnical} label="Technical Depth" size={110} color="#34d399" />
                    {hasVoiceData && <ScoreCircle score={avgVoice} label="Voice Delivery" size={110} color="#fbbf24" />}
                    <ScoreCircle
                        score={Math.round(hasVoiceData ? (avgConfidence + avgClarity + avgTechnical + avgVoice) / 4 : (avgConfidence + avgClarity + avgTechnical) / 3)}
                        label="Overall Score"
                        size={110}
                    />
                </div>
            </div>

            {/* Question-by-Question Review */}
            <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <HiOutlineShieldCheck className="text-indigo-400" />
                    Question-by-Question Diagnostic Review
                </h3>

                {results.map((result, i) => (
                    <div key={i} className="glass-card rounded-3xl p-6 lg:p-7 space-y-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[11px] text-slate-400 font-semibold">Question {i + 1}</span>
                                    {result.wasVoiceRecorded && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/25 text-rose-300">
                                            🎤 Spoken
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-white font-semibold text-sm leading-relaxed">{result.question}</h4>
                            </div>

                            <div className="flex gap-3">
                                {result.evaluation && (
                                    <div className="text-center px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                        <div className="text-sm font-bold font-mono-metric text-emerald-400">{result.evaluation.score}%</div>
                                        <div className="text-[10px] text-slate-400">Score</div>
                                    </div>
                                )}
                                <div className="text-center px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                    <div className="text-sm font-bold font-mono-metric text-indigo-400">{result.nlpAnalysis.confidenceScore}%</div>
                                    <div className="text-[10px] text-slate-400">Conf.</div>
                                </div>
                            </div>
                        </div>

                        {/* Candidate Answer Transcript */}
                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.05]">
                            <p className="text-[11px] text-slate-400 font-semibold mb-1">Candidate Response:</p>
                            <p className="text-slate-200 text-xs leading-relaxed">{result.answer}</p>
                        </div>

                        {/* STAR Checklist & Dimensions */}
                        {result.evaluation && (
                            <div className="p-4 rounded-2xl bg-indigo-500/[0.04] border border-indigo-500/15 space-y-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-1">AI Evaluator Feedback</p>
                                    <p className="text-xs text-slate-200 leading-relaxed">{result.evaluation.feedback}</p>
                                </div>

                                {result.evaluation.dimensions && (
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/[0.05]">
                                        {[
                                            { label: 'Relevance', val: result.evaluation.dimensions.relevance },
                                            { label: 'STAR Flow', val: result.evaluation.dimensions.structure },
                                            { label: 'Tech Depth', val: result.evaluation.dimensions.technicalDepth },
                                            { label: 'Confidence', val: result.evaluation.dimensions.confidence },
                                            { label: 'Conciseness', val: result.evaluation.dimensions.conciseness },
                                        ].map((d) => (
                                            <div key={d.label} className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                                                <div className="text-xs font-bold font-mono-metric text-indigo-300">{d.val}%</div>
                                                <div className="text-[10px] text-slate-400">{d.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {result.evaluation.starChecklist && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <span className={`text-[11px] px-2.5 py-1 rounded-lg border ${result.evaluation.starChecklist.answeredQuestion ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                                            {result.evaluation.starChecklist.answeredQuestion ? '✓' : '✗'} Direct Answer
                                        </span>
                                        <span className={`text-[11px] px-2.5 py-1 rounded-lg border ${result.evaluation.starChecklist.gaveConcreteExample ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                                            {result.evaluation.starChecklist.gaveConcreteExample ? '✓' : '✗'} Concrete Example
                                        </span>
                                        <span className={`text-[11px] px-2.5 py-1 rounded-lg border ${result.evaluation.starChecklist.mentionedMeasurableImpact ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                                            {result.evaluation.starChecklist.mentionedMeasurableImpact ? '✓' : '✗'} Measurable Metrics
                                        </span>
                                        <span className={`text-[11px] px-2.5 py-1 rounded-lg border ${result.evaluation.starChecklist.structuredWell ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                                            {result.evaluation.starChecklist.structuredWell ? '✓' : '✗'} Structured Flow
                                        </span>
                                    </div>
                                )}

                                {result.evaluation.idealAnswerSnippet && (
                                    <div className="p-3 rounded-xl bg-black/40 border border-indigo-500/20 text-xs">
                                        <p className="font-bold text-indigo-300 mb-1">✨ Exemplary Formulation Sample:</p>
                                        <p className="text-slate-300 italic">&ldquo;{result.evaluation.idealAnswerSnippet}&rdquo;</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
