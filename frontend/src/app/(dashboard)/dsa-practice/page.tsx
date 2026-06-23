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

const LANGUAGES = ['C', 'C++', 'Java', 'Python'];
const TOPICS = ['Mixed', 'Arrays', 'Linked List', 'Stacks', 'Trees', 'Dynamic Programming', 'Graphs', 'Sorting'];
const DIFFICULTIES = ['Mixed', 'Easy', 'Medium', 'Hard'];
const QUESTION_COUNTS = [5, 10, 15, 20];

const TOPIC_ICONS: Record<string, string> = {
    Mixed: '🔀', Arrays: '📊', 'Linked List': '🔗', Stacks: '📚',
    Trees: '🌲', 'Dynamic Programming': '🧮', Graphs: '🕸️', Sorting: '🔄',
};
const COMPANY_COLORS: Record<string, string> = {
    Google: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Amazon: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    Microsoft: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    Meta: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    Apple: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
    Uber: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Netflix: 'bg-red-500/20 text-red-300 border-red-500/30',
};
const DIFF_COLORS: Record<string, string> = {
    Easy: 'bg-emerald-500/20 text-emerald-400',
    Medium: 'bg-amber-500/20 text-amber-400',
    Hard: 'bg-red-500/20 text-red-400',
    Mixed: 'bg-violet-500/20 text-violet-400',
};
const LANG_COLORS: Record<string, string> = {
    C: 'bg-slate-600/30 text-slate-300 border-slate-500/30',
    'C++': 'bg-blue-700/30 text-blue-300 border-blue-600/30',
    Java: 'bg-orange-700/30 text-orange-300 border-orange-600/30',
    Python: 'bg-yellow-600/30 text-yellow-200 border-yellow-500/30',
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
                    const existing = JSON.parse(localStorage.getItem('evolveai_dsa_sessions') || '[]');
                    existing.unshift(session);
                    localStorage.setItem('evolveai_dsa_sessions', JSON.stringify(existing.slice(0, 50)));
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
        if (!answered) return 'border-white/10 text-gray-300 hover:border-violet-500/50 hover:bg-violet-500/5 cursor-pointer';
        if (isSkipped) {
            return idx === currentQ.answer
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                : 'border-white/5 text-gray-600 opacity-40';
        }
        if (idx === currentQ.answer) return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
        if (idx === selectedOption) return 'border-red-500/50 bg-red-500/10 text-red-300';
        return 'border-white/5 text-gray-600 opacity-40';
    };

    const optionIcon = (idx: number) => {
        if (!answered) return null;
        if (idx === currentQ.answer) return <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
        if (!isSkipped && idx === selectedOption) return <HiOutlineXCircle className="w-5 h-5 text-red-400 flex-shrink-0" />;
        return null;
    };

    const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

    // ══════════════════════════════════════════════════════════════════════════
    // SETUP SCREEN
    // ══════════════════════════════════════════════════════════════════════════
    if (step === 'setup') return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">DSA Practice Quiz</h1>
                <p className="text-gray-400">Company-tagged MCQs across 7 DSA topics — questions & answer order shuffle every session.</p>
            </div>

            {/* Language */}
            <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Programming Language</h2>
                <div className="flex gap-3 flex-wrap">
                    {LANGUAGES.map(l => (
                        <button key={l} onClick={() => setLanguage(l)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${language === l
                                ? `${LANG_COLORS[l]}`
                                : 'glass-card text-gray-400 border-white/10 hover:border-white/25 hover:text-gray-200'}`}>
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Topic */}
            <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">DSA Topic</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TOPICS.map(t => (
                        <button key={t} onClick={() => setTopic(t)}
                            className={`p-3 rounded-xl text-sm font-medium border transition-all text-left ${topic === t
                                ? 'bg-violet-500/15 border-violet-500/40 text-white'
                                : 'glass-card text-gray-400 border-white/10 hover:border-white/25 hover:text-gray-200'}`}>
                            {TOPIC_ICONS[t]} {t === 'Dynamic Programming' ? 'Dynamic Prog.' : t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Difficulty + Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Difficulty</h2>
                    <div className="flex gap-2 flex-wrap">
                        {DIFFICULTIES.map(d => (
                            <button key={d} onClick={() => setDifficulty(d)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${difficulty === d
                                    ? `${DIFF_COLORS[d]} border-current`
                                    : 'glass-card text-gray-400 border-white/10 hover:border-white/25'}`}>
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Questions</h2>
                    <div className="flex gap-2">
                        {QUESTION_COUNTS.map(c => (
                            <button key={c} onClick={() => setCount(c)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${count === c
                                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                                    : 'glass-card text-gray-400 border-white/10 hover:border-white/25'}`}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                    <HiOutlineExclamationCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
            )}

            <button onClick={startQuiz} disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading
                    ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading Questions…</>
                    : <><HiOutlinePlay className="w-5 h-5" />Start Quiz</>}
            </button>
        </div>
    );

    // ══════════════════════════════════════════════════════════════════════════
    // QUIZ SCREEN
    // ══════════════════════════════════════════════════════════════════════════
    if (step === 'quiz' && currentQ) return (
        <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border ${LANG_COLORS[language]}`}>{language}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${DIFF_COLORS[currentQ.difficulty]}`}>{currentQ.difficulty}</span>
                    </div>
                    <p className="text-sm text-gray-400">Question <span className="text-white font-semibold">{currentIndex + 1}</span> / {questions.length}</p>
                </div>
                {/* Dot progress */}
                <div className="flex gap-1.5 flex-wrap justify-end max-w-[160px]">
                    {questions.map((_, i) => (
                        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < currentIndex
                            ? (results[i]?.skipped ? 'bg-gray-500' : results[i]?.correct ? 'bg-emerald-500' : 'bg-red-500')
                            : i === currentIndex ? 'bg-violet-500 animate-pulse' : 'bg-white/10'}`} />
                    ))}
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${progressPct}%` }} />
            </div>

            {/* Question card */}
            <div className="glass-card rounded-2xl p-6 space-y-5">
                {/* Company tag + question */}
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-white text-lg font-medium leading-relaxed flex-1">{currentQ.question}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap flex-shrink-0 ${COMPANY_COLORS[currentQ.company] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                        🏢 {currentQ.company}
                    </span>
                </div>

                {/* Topic badge */}
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                    {TOPIC_ICONS[currentQ.topic]} {currentQ.topic}
                </span>

                {/* Options */}
                <div className="space-y-2.5">
                    {currentQ.options.map((opt, i) => (
                        <button key={i} onClick={() => selectOption(i)} disabled={answered}
                            className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-3 ${optionClass(i)}`}>
                            <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {String.fromCharCode(65 + i)}
                            </span>
                            <span className="flex-1 text-sm leading-snug">{opt}</span>
                            {optionIcon(i)}
                        </button>
                    ))}
                </div>

                {/* Explanation banner */}
                {answered && (
                    <div className={`p-4 rounded-xl border ${isSkipped
                        ? 'bg-gray-500/5 border-gray-500/20'
                        : selectedOption === currentQ.answer
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-red-500/5 border-red-500/20'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {isSkipped
                                ? <HiOutlineLightBulb className="w-4 h-4 text-gray-400" />
                                : selectedOption === currentQ.answer
                                    ? <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" />
                                    : <HiOutlineXCircle className="w-4 h-4 text-red-400" />}
                            <span className={`text-xs font-semibold ${isSkipped ? 'text-gray-400' : selectedOption === currentQ.answer ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isSkipped ? 'Skipped — correct answer shown' : selectedOption === currentQ.answer ? 'Correct! 🎉' : 'Incorrect'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300">{currentQ.explanation}</p>
                    </div>
                )}

                {/* Controls */}
                <div className="flex items-center justify-between pt-1">
                    {!answered
                        ? <button onClick={skip} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:text-gray-200 hover:border-white/20 transition-all">
                            <HiOutlineForward className="w-4 h-4" />Skip
                        </button>
                        : <div />}
                    {answered && (
                        <button onClick={next}
                            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-500/25">
                            {currentIndex < questions.length - 1
                                ? <>Next <HiOutlineArrowRight className="w-4 h-4" /></>
                                : <>Finish <HiOutlineCheckCircle className="w-4 h-4" /></>}
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
        const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';

        return (
            <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete! 🎉</h1>
                    <p className="text-gray-400">{TOPIC_ICONS[topic]} {topic} · {difficulty} difficulty · {language} · {results.length} questions</p>
                </div>

                {/* Score hero */}
                <div className="glass-card rounded-2xl p-8 text-center">
                    {analyzing
                        ? <div className="flex items-center justify-center gap-3 py-4">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-violet-400 rounded-full animate-spin" />
                            <span className="text-gray-400">Generating your analysis…</span>
                        </div>
                        : <>
                            <div className={`text-7xl font-bold mb-3 ${scoreColor}`}>{score}%</div>
                            <p className="text-gray-400 text-lg">
                                {score >= 80 ? '🔥 Outstanding! You\'re well-prepared.'
                                    : score >= 60 ? '👍 Good progress — a bit more practice will sharpen the edges.'
                                        : '📚 Keep going — review the explanations and revisit weak topics.'}
                            </p>
                        </>}
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Correct', value: correct, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                        { label: 'Wrong', value: wrong, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                        { label: 'Skipped', value: skippedCount, color: 'text-gray-300', bg: 'bg-gray-500/10 border-gray-500/20' },
                        { label: 'Total', value: results.length, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
                    ].map((s, i) => (
                        <div key={i} className={`rounded-xl p-5 border ${s.bg} text-center`}>
                            <div className={`text-3xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                            <div className="text-xs text-gray-400">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Topic breakdown */}
                {analysis?.topicBreakdown && analysis.topicBreakdown.length > 0 && (
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-5">Topic Breakdown</h3>
                        <div className="space-y-4">
                            {analysis.topicBreakdown.map((tb, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-300">{TOPIC_ICONS[tb.topic]} {tb.topic}</span>
                                        <span className={`font-semibold ${tb.score >= 80 ? 'text-emerald-400' : tb.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                            {tb.correct}/{tb.total} ({tb.score}%)
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-700 ${tb.score >= 80 ? 'bg-emerald-500' : tb.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${tb.score}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Study tips */}
                {analysis?.studyTips && analysis.studyTips.length > 0 && (
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <HiOutlineLightBulb className="w-5 h-5 text-amber-400" />Study Tips for Weak Areas
                        </h3>
                        <div className="space-y-3">
                            {analysis.studyTips.map((tip, i) => (
                                <div key={i} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 flex gap-3">
                                    <span className="text-amber-400 mt-0.5 flex-shrink-0">💡</span>
                                    <p className="text-gray-300 text-sm">{tip}</p>
                                </div>
                            ))}
                        </div>
                        {analysis.weakTopics.length > 0 && (
                            <div className="mt-4 flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-500">Focus on:</span>
                                {analysis.weakTopics.map((wt, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">{wt}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Per-question review */}
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-5">Question Review</h3>
                    <div className="space-y-3">
                        {results.map((r, i) => (
                            <div key={i} className={`p-4 rounded-xl border ${r.skipped ? 'bg-gray-500/5 border-gray-500/15' : r.correct ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${r.skipped ? 'bg-gray-500/30 text-gray-400' : r.correct ? 'bg-emerald-500/30 text-emerald-400' : 'bg-red-500/30 text-red-400'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-200 mb-1">{r.question}</p>
                                        {!r.correct && !r.skipped && r.selectedOption !== null && (
                                            <p className="text-xs text-red-400 mb-1">Your answer: {r.options[r.selectedOption]}</p>
                                        )}
                                        <p className="text-xs text-gray-400 leading-relaxed">{r.explanation}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap ${r.skipped ? 'bg-gray-500/20 text-gray-400' : r.correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {r.skipped ? 'Skipped' : r.correct ? '✓ Correct' : '✗ Wrong'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={restart}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2">
                    <HiOutlineArrowPath className="w-5 h-5" />Practice Again
                </button>
            </div>
        );
    }

    return null;
}
