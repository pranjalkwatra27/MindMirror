'use client';

import { useState } from 'react';
import {
    HiOutlinePlay,
    HiOutlineArrowRight,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineForward,
    HiOutlineArrowPath,
    HiOutlineLightBulb,
    HiOutlineExclamationCircle,
    HiOutlinePuzzlePiece,
} from 'react-icons/hi2';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Question {
    id: string;
    topic: string;
    difficulty: string;
    company: string;
    question: string;
    options: string[];
    answer: number;
    explanation: string;
}

interface QuizResult {
    questionId: string;
    topic: string;
    question: string;
    selectedOption: number | null;
    correct: boolean;
    skipped: boolean;
    correctAnswer: number;
    options: string[];
    explanation: string;
}

interface AnalysisData {
    score: number;
    total: number;
    correct: number;
    wrong: number;
    skipped: number;
    topicBreakdown: { topic: string; total: number; correct: number; score: number }[];
    weakTopics: string[];
    studyTips: string[];
}

// ── Constants ──────────────────────────────────────────────────────────────────

const LANGUAGES = ['Python', 'C++', 'Java', 'C'];
const TOPICS = ['Mixed', 'Arrays', 'Linked List', 'Stacks', 'Trees', 'Dynamic Programming', 'Graphs', 'Sorting'];
const DIFFICULTIES = ['Mixed', 'Easy', 'Medium', 'Hard'];
const QUESTION_COUNTS = [5, 10, 15, 20];

const TOPIC_ICONS: Record<string, string> = {
    Mixed: '🔀', Arrays: '📊', 'Linked List': '🔗', Stacks: '📚',
    Trees: '🌲', 'Dynamic Programming': '🧮', Graphs: '🕸️', Sorting: '🔄',
};

const COMPANY_COLORS: Record<string, string> = {
    Google: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    Amazon: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Microsoft: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    Meta: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    Apple: 'bg-slate-400/15 text-slate-300 border-slate-400/30',
    Uber: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    Netflix: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const DIFF_COLORS: Record<string, string> = {
    Easy: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    Medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    Hard: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
    Mixed: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25',
};

const LANG_COLORS: Record<string, string> = {
    Python: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40',
    'C++': 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40',
    Java: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
    C: 'bg-slate-500/20 text-slate-200 border-slate-500/40',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function post<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data as T;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function DSAPracticePage() {
    // Setup
    const [language, setLanguage] = useState('Python');
    const [topic, setTopic] = useState('Mixed');
    const [difficulty, setDifficulty] = useState('Mixed');
    const [count, setCount] = useState(10);

    // Session
    const [step, setStep] = useState<'setup' | 'quiz' | 'results'>('setup');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answered, setAnswered] = useState(false);
    const [isSkipped, setIsSkipped] = useState(false);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState('');

    const currentQ = questions[currentIndex];
    const progressPct = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;

    // ── Handlers ──────────────────────────────────────────────────────────────

    const startQuiz = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await post<{ questions: Question[] }>('/dsa/generate', { topic, difficulty, count, language });
            setQuestions(res.questions);
            setCurrentIndex(0);
            setResults([]);
            setSelectedOption(null);
            setAnswered(false);
            setIsSkipped(false);
            setAnalysis(null);
            setStep('quiz');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const selectOption = (idx: number) => {
        if (answered) return;
        setSelectedOption(idx);
        setAnswered(true);
        setIsSkipped(false);
    };

    const skip = () => {
        if (answered) return;
        setIsSkipped(true);
        setAnswered(true);
        setSelectedOption(null);
    };

    const next = async () => {
        if (!currentQ) return;
        const result: QuizResult = {
            questionId: currentQ.id,
            topic: currentQ.topic,
            question: currentQ.question,
            selectedOption,
            correct: !isSkipped && selectedOption === currentQ.answer,
            skipped: isSkipped,
            correctAnswer: currentQ.answer,
            options: currentQ.options,
            explanation: currentQ.explanation,
        };
        const newResults = [...results, result];
        setResults(newResults);
        setSelectedOption(null);
        setAnswered(false);
        setIsSkipped(false);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            setStep('results');
            setAnalyzing(true);
            try {
                const payload = newResults.map(r => ({ questionId: r.questionId, topic: r.topic, correct: r.correct, skipped: r.skipped }));
                const data = await post<AnalysisData>('/dsa/analyze', { results: payload });
                setAnalysis(data);
                // Persist to localStorage for Progress page
                const session = {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    topic, difficulty, language,
                    score: data.score,
                    correct: data.correct,
                    wrong: data.wrong,
                    skipped: data.skipped,
                    total: data.total,
                    weakTopics: data.weakTopics,
                    topicBreakdown: data.topicBreakdown,
                };
                try {
                    const existing = JSON.parse(localStorage.getItem('mindmirror_dsa_sessions') || localStorage.getItem('evolveai_dsa_sessions') || '[]');
                    existing.unshift(session);
                    localStorage.setItem('mindmirror_dsa_sessions', JSON.stringify(existing.slice(0, 50)));
                } catch { /* ignore localStorage errors */ }
            } catch (err) {
                console.error('Analysis error:', err);
            } finally {
                setAnalyzing(false);
            }
        }
    };

    const restart = () => {
        setStep('setup');
        setQuestions([]);
        setResults([]);
        setAnalysis(null);
        setCurrentIndex(0);
        setAnswered(false);
        setIsSkipped(false);
        setSelectedOption(null);
    };

    // ── Option styling helpers ────────────────────────────────────────────────

    const optionClass = (idx: number) => {
        if (!answered) return 'border-white/[0.08] text-slate-200 hover:border-indigo-500/50 hover:bg-indigo-500/[0.06] cursor-pointer';
        if (isSkipped) {
            return idx === currentQ.answer
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                : 'border-white/[0.04] text-slate-500 opacity-40';
        }
        if (idx === currentQ.answer) return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold';
        if (idx === selectedOption) return 'border-rose-500/50 bg-rose-500/10 text-rose-300';
        return 'border-white/[0.04] text-slate-500 opacity-40';
    };

    const optionIcon = (idx: number) => {
        if (!answered) return null;
        if (idx === currentQ.answer) return <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
        if (!isSkipped && idx === selectedOption) return <HiOutlineXCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        return null;
    };

    // ══════════════════════════════════════════════════════════════════════════
    // SETUP SCREEN
    // ══════════════════════════════════════════════════════════════════════════
    if (step === 'setup') return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1432] via-[#0d1228] to-[#070914] border border-white/[0.08] p-7 lg:p-9 shadow-2xl backdrop-blur-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide mb-3">
                        <HiOutlinePuzzlePiece className="w-3.5 h-3.5" />
                        AI Weakness Mapper &amp; Practice Arena
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                        DSA Diagnostic &amp; Practice Quiz
                    </h1>
                    <p className="text-slate-300 text-xs lg:text-sm mt-1 max-w-2xl leading-relaxed">
                        Curated company-tagged MCQs across 7 core DSA disciplines. Questions and options dynamically shuffle with automatic AI weakness identification.
                    </p>
                </div>
            </div>

            {/* Language */}
            <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">1. Select Target Language</h2>
                <div className="flex gap-3 flex-wrap">
                    {LANGUAGES.map(l => (
                        <button
                            key={l}
                            onClick={() => setLanguage(l)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                                language === l
                                    ? `${LANG_COLORS[l]} shadow-md`
                                    : 'glass-card text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Topic */}
            <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">2. Select DSA Topic</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TOPICS.map(t => (
                        <button
                            key={t}
                            onClick={() => setTopic(t)}
                            className={`p-4 rounded-2xl text-xs font-semibold border transition-all text-left flex items-center gap-2 ${
                                topic === t
                                    ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md'
                                    : 'glass-card text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <span className="text-base">{TOPIC_ICONS[t]}</span>
                            <span className="truncate">{t}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Difficulty + Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">3. Difficulty Level</h2>
                    <div className="flex gap-2 flex-wrap">
                        {DIFFICULTIES.map(d => (
                            <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                                    difficulty === d
                                        ? `${DIFF_COLORS[d]} shadow-md font-bold`
                                        : 'glass-card text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">4. Question Count</h2>
                    <div className="flex gap-2">
                        {QUESTION_COUNTS.map(c => (
                            <button
                                key={c}
                                onClick={() => setCount(c)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-mono-metric font-semibold border transition-all ${
                                    count === c
                                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-md font-bold'
                                        : 'glass-card text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {c} Qs
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                    <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex justify-center pt-2">
                <button
                    onClick={startQuiz}
                    disabled={loading}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 disabled:opacity-40 transition-all flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Synthesizing DSA Challenge…
                        </>
                    ) : (
                        <>
                            <HiOutlinePlay className="w-4 h-4" />
                            Start Practice Session
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    // ══════════════════════════════════════════════════════════════════════════
    // QUIZ SCREEN
    // ══════════════════════════════════════════════════════════════════════════
    if (step === 'quiz' && currentQ) return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-5 animate-fade-in">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-md border font-semibold ${LANG_COLORS[language]}`}>{language}</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-semibold ${DIFF_COLORS[currentQ.difficulty]}`}>{currentQ.difficulty}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                        Question <span className="text-white font-bold font-mono-metric">{currentIndex + 1}</span> of {questions.length}
                    </p>
                </div>
                {/* Dot progress */}
                <div className="flex gap-1.5 flex-wrap justify-end max-w-[200px]">
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                                i < currentIndex
                                    ? results[i]?.skipped
                                        ? 'bg-slate-500'
                                        : results[i]?.correct
                                        ? 'bg-emerald-400'
                                        : 'bg-rose-500'
                                    : i === currentIndex
                                    ? 'bg-indigo-400 animate-pulse scale-125'
                                    : 'bg-white/[0.12]'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                />
            </div>

            {/* Question card */}
            <div className="glass-card rounded-3xl p-7 lg:p-8 space-y-6">
                {/* Company tag + question */}
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-white text-base lg:text-lg font-semibold leading-relaxed flex-1">
                        {currentQ.question}
                    </h3>
                    <span className={`text-[11px] px-3 py-1 rounded-full border whitespace-nowrap shrink-0 font-semibold ${COMPANY_COLORS[currentQ.company] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'}`}>
                        🏢 {currentQ.company}
                    </span>
                </div>

                {/* Topic badge */}
                <span className="inline-block text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-300 font-medium">
                    {TOPIC_ICONS[currentQ.topic]} {currentQ.topic}
                </span>

                {/* Options */}
                <div className="space-y-2.5">
                    {currentQ.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => selectOption(i)}
                            disabled={answered}
                            className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3.5 ${optionClass(i)}`}
                        >
                            <span className="w-7 h-7 rounded-xl bg-white/[0.06] flex items-center justify-center text-xs font-mono-metric font-bold shrink-0">
                                {String.fromCharCode(65 + i)}
                            </span>
                            <span className="flex-1 text-xs lg:text-sm leading-relaxed">{opt}</span>
                            {optionIcon(i)}
                        </button>
                    ))}
                </div>

                {/* Explanation banner */}
                {answered && (
                    <div className={`p-4 rounded-2xl border ${
                        isSkipped
                            ? 'bg-slate-500/[0.06] border-slate-500/20'
                            : selectedOption === currentQ.answer
                            ? 'bg-emerald-500/[0.06] border-emerald-500/20'
                            : 'bg-rose-500/[0.06] border-rose-500/20'
                    }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                            {isSkipped ? (
                                <HiOutlineLightBulb className="w-4 h-4 text-slate-400" />
                            ) : selectedOption === currentQ.answer ? (
                                <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <HiOutlineXCircle className="w-4 h-4 text-rose-400" />
                            )}
                            <span className={`text-xs font-bold ${
                                isSkipped ? 'text-slate-300' : selectedOption === currentQ.answer ? 'text-emerald-300' : 'text-rose-300'
                            }`}>
                                {isSkipped ? 'Question Skipped — Solution Below' : selectedOption === currentQ.answer ? 'Correct Solution! 🎉' : 'Incorrect Solution'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">{currentQ.explanation}</p>
                    </div>
                )}

                {/* Controls */}
                <div className="flex items-center justify-between pt-2">
                    {!answered ? (
                        <button
                            onClick={skip}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-slate-400 border border-white/[0.08] hover:text-slate-200 hover:bg-white/[0.04] transition-all"
                        >
                            <HiOutlineForward className="w-3.5 h-3.5" />
                            Skip Question
                        </button>
                    ) : <div />}

                    {answered && (
                        <button
                            onClick={next}
                            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-semibold hover:from-indigo-500 hover:to-cyan-500 transition-all shadow-lg shadow-indigo-500/25"
                        >
                            {currentIndex < questions.length - 1 ? (
                                <>
                                    Next Question
                                    <HiOutlineArrowRight className="w-3.5 h-3.5" />
                                </>
                            ) : (
                                <>
                                    Finish &amp; Analyze Results
                                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // ══════════════════════════════════════════════════════════════════════════
    // RESULTS SCREEN
    // ══════════════════════════════════════════════════════════════════════════
    if (step === 'results') {
        const score = analysis?.score ?? Math.round((results.filter(r => r.correct).length / results.length) * 100);
        const correct = analysis?.correct ?? results.filter(r => r.correct).length;
        const wrong = analysis?.wrong ?? results.filter(r => !r.correct && !r.skipped).length;
        const skippedCount = analysis?.skipped ?? results.filter(r => r.skipped).length;
        const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400';

        return (
            <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                        DSA Diagnostic Results 🎉
                    </h1>
                    <p className="text-slate-400 text-xs mt-0.5">
                        {TOPIC_ICONS[topic]} {topic} • {difficulty} Level • {language} • {results.length} Questions Evaluated
                    </p>
                </div>

                {/* Score hero */}
                <div className="glass-card rounded-3xl p-8 text-center">
                    {analyzing ? (
                        <div className="flex items-center justify-center gap-3 py-6">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-indigo-400 rounded-full animate-spin" />
                            <span className="text-slate-400 text-xs">Mapping topic proficiency &amp; study tips…</span>
                        </div>
                    ) : (
                        <>
                            <div className={`text-6xl font-black font-mono-metric mb-2 ${scoreColor}`}>{score}%</div>
                            <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                                {score >= 80 ? '🔥 Outstanding mastery! Strong algorithmic intuition.'
                                    : score >= 60 ? '👍 Solid foundation — targeted practice on edge cases will push you to 90%+.'
                                    : '📚 Keep pushing — review the topic breakdown below and reinforce core mechanics.'}
                            </p>
                        </>
                    )}
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Correct', value: correct, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                        { label: 'Wrong', value: wrong, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
                        { label: 'Skipped', value: skippedCount, color: 'text-slate-300', bg: 'bg-slate-500/10 border-slate-500/20' },
                        { label: 'Total', value: results.length, color: 'text-indigo-300', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                    ].map((s, i) => (
                        <div key={i} className={`rounded-2xl p-5 border ${s.bg} text-center`}>
                            <div className={`text-2xl font-bold font-mono-metric mb-0.5 ${s.color}`}>{s.value}</div>
                            <div className="text-[11px] text-slate-400">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Topic breakdown */}
                {analysis?.topicBreakdown && analysis.topicBreakdown.length > 0 && (
                    <div className="glass-card rounded-3xl p-6 lg:p-7 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Topic Proficiency Mapping</h3>
                        <div className="space-y-3.5">
                            {analysis.topicBreakdown.map((tb, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-300">{TOPIC_ICONS[tb.topic]} {tb.topic}</span>
                                        <span className={`font-mono-metric font-semibold ${tb.score >= 80 ? 'text-emerald-400' : tb.score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                                            {tb.correct}/{tb.total} ({tb.score}%)
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${tb.score >= 80 ? 'bg-emerald-400' : tb.score >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                            style={{ width: `${tb.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Study tips */}
                {analysis?.studyTips && analysis.studyTips.length > 0 && (
                    <div className="glass-card rounded-3xl p-6 lg:p-7 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                            <HiOutlineLightBulb className="text-amber-400" />
                            AI Recommended Focus Areas &amp; Tips
                        </h3>
                        <div className="space-y-2.5">
                            {analysis.studyTips.map((tip, i) => (
                                <div key={i} className="p-3.5 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15 flex gap-3 items-start">
                                    <span className="text-amber-400 mt-0.5 shrink-0">💡</span>
                                    <p className="text-slate-300 text-xs leading-relaxed">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-center">
                    <button
                        onClick={restart}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
                    >
                        <HiOutlineArrowPath className="w-4 h-4" />
                        Practice Another Topic
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
