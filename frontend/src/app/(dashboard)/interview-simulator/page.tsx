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
} from 'react-icons/hi2';

interface Question {
    question: string;
    category: string;
    difficulty: string;
    expectedKeyPoints?: string[];
    tips?: string[];
}

interface Evaluation {
    score: number;
    feedback: string;
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
    { id: 'HR', label: 'HR Round', desc: 'Communication, motivation, career goals', icon: '💬', color: 'violet' },
    { id: 'Technical', label: 'Technical Round', desc: 'Coding, system design, problem-solving', icon: '💻', color: 'cyan' },
    { id: 'Behavioral', label: 'Behavioral Round', desc: 'Past experiences, teamwork, challenges', icon: '🧠', color: 'emerald' },
    { id: 'Rapid-Fire-DSA', label: 'Rapid Fire DSA', desc: 'Quick DSA problems and algorithms', icon: '⚡', color: 'amber' },
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
    const [mode, setMode] = useState('');
    const [role, setRole] = useState('');
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
        d === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
        d === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
        d === 'Hard' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400';

    const fmtTime = (s: number) =>
        `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // ── SETUP ─────────────────────────────────────────────────────────────────
    if (step === 'setup') return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">AI Interview Simulator</h1>
                <p className="text-gray-400">Pick a mode &amp; role — fresh AI questions every time. Type or speak your answers.</p>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Interview Mode</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MODES.map(m => (
                        <button key={m.id} onClick={() => setMode(m.id)}
                            className={`p-5 rounded-xl text-left transition-all duration-300 border ${
                                mode === m.id
                                    ? `bg-${m.color}-500/10 border-${m.color}-500/40 shadow-lg shadow-${m.color}-500/10`
                                    : 'glass-card hover:border-white/20'}`}>
                            <span className="text-2xl block mb-2">{m.icon}</span>
                            <h3 className="text-white font-semibold mb-1">{m.label}</h3>
                            <p className="text-gray-400 text-sm">{m.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Target Role</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {ROLES.map(r => (
                        <button key={r} onClick={() => setRole(r)}
                            className={`p-4 rounded-xl text-sm font-medium transition-all duration-300 border ${
                                role === r ? 'bg-violet-500/15 border-violet-500/40 text-white'
                                    : 'glass-card text-gray-400 hover:text-white hover:border-white/20'}`}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>
            {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
            <button onClick={startInterview} disabled={!mode || !role || loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating Fresh AI Questions…</>) : (<><HiOutlinePlay className="w-5 h-5" />Start Interview</>)}
            </button>
        </div>
    );

    // ── INTERVIEW ─────────────────────────────────────────────────────────────
    if (step === 'interview') {
        const question = questions[currentQ];
        return (
            <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">{mode} Round</span>
                        <h2 className="text-xl font-bold text-white">Question {currentQ + 1} of {questions.length}</h2>
                    </div>
                    <div className="flex gap-1.5">
                        {questions.map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full transition-all ${
                                i < currentQ ? 'bg-emerald-500' : i === currentQ ? 'bg-violet-500 animate-pulse' : 'bg-white/10'}`} />
                        ))}
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-8">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                            <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                {question?.category && <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">{question.category}</span>}
                                {question?.difficulty && <span className={`text-xs px-2 py-0.5 rounded-full ${diffColor(question.difficulty)}`}>{question.difficulty}</span>}
                            </div>
                            <h3 className="text-xl text-white font-medium leading-relaxed">{question?.question}</h3>
                        </div>
                    </div>

                    {question?.tips && question.tips.length > 0 && (
                        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 mb-6">
                            <p className="text-xs text-cyan-400 font-medium mb-2">💡 Tips</p>
                            <ul className="space-y-1">{question.tips.map((tip, i) => <li key={i} className="text-gray-400 text-sm">• {tip}</li>)}</ul>
                        </div>
                    )}

                    <div className="relative">
                        <textarea value={answer} onChange={e => setAnswer(e.target.value)}
                            placeholder={isRecording ? '🎤 Listening… speak your answer clearly' : 'Type your answer, or click "Record Answer" to speak…'}
                            rows={8}
                            className={`w-full p-4 rounded-xl bg-white/5 border text-white placeholder-gray-500 focus:outline-none transition-all resize-none ${
                                isRecording ? 'border-red-500/50 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20'
                                    : 'border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20'}`} />
                        {isRecording && (
                            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-red-400 text-xs font-mono">{fmtTime(recordingDuration)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                            {voiceSupported && (
                                <button onClick={isRecording ? stopRecording : startRecording} type="button"
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 border ${
                                        isRecording ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
                                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'}`}>
                                    {isRecording ? <><HiOutlineStop className="w-4 h-4" />Stop Recording</> : <><HiOutlineMicrophone className="w-4 h-4" />Record Answer</>}
                                </button>
                            )}
                            <span className="text-xs text-gray-500">
                                {answer.split(/\s+/).filter(Boolean).length} words
                                {wasVoice && !isRecording && <span className="ml-2 text-red-400/70">🎤 voice</span>}
                            </span>
                        </div>
                        <button onClick={submitAnswer} disabled={!answer.trim() || submitting}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {submitting ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing…</>) :
                                currentQ < questions.length - 1 ? (<>Submit &amp; Next<HiOutlineArrowRight className="w-4 h-4" /></>) :
                                (<>Submit &amp; Finish<HiOutlineCheckCircle className="w-4 h-4" /></>)}
                        </button>
                    </div>
                    {!voiceSupported && <p className="text-xs text-gray-500 mt-3">Voice recording requires Chrome or Edge browser.</p>}
                </div>

                {answer.trim().length > 10 && (
                    <div className="glass-card rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                            <HiOutlineSparkles className="w-4 h-4 text-violet-400" />Live Analysis Preview
                        </p>
                        {(() => {
                            const live = analyzeText(answer);
                            return (
                                <div className="flex items-center gap-6 flex-wrap">
                                    <div><span className="text-white font-bold text-lg">{live.confidenceScore}%</span><span className="text-gray-400 text-xs ml-2">Confidence</span></div>
                                    <div className="w-px h-6 bg-white/10" />
                                    <div><span className="text-white font-bold text-lg">{live.clarityScore}%</span><span className="text-gray-400 text-xs ml-2">Clarity</span></div>
                                    <div className="w-px h-6 bg-white/10" />
                                    <div><span className="text-white font-bold text-lg">{live.fillerWordCount}</span><span className="text-gray-400 text-xs ml-2">Filler Words</span></div>
                                    {isRecording && (<><div className="w-px h-6 bg-white/10" /><div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /><span className="text-red-400 text-xs">Recording {fmtTime(recordingDuration)}</span></div></>)}
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        );
    }

    // ── RESULTS ───────────────────────────────────────────────────────────────
    const { avgConfidence, avgClarity, avgTechnical, avgVoice } = getOverallScores();
    const hasVoiceData = results.some(r => r.voiceAnalysis);

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Interview Complete! 🎉</h1>
                <p className="text-gray-400">{mode} Round · {role} · {results.length} questions answered</p>
            </div>

            <div className="glass-card rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-6">Overall Performance</h3>
                <div className="flex flex-wrap items-center justify-around gap-8">
                    <ScoreCircle score={avgConfidence} label="Confidence" size={120} color="#8b5cf6" />
                    <ScoreCircle score={avgClarity} label="Clarity" size={120} color="#06b6d4" />
                    <ScoreCircle score={avgTechnical} label="AI Score" size={120} color="#22c55e" />
                    {hasVoiceData && <ScoreCircle score={avgVoice} label="Voice Quality" size={120} color="#f59e0b" />}
                    <ScoreCircle score={Math.round(hasVoiceData ? (avgConfidence + avgClarity + avgTechnical + avgVoice) / 4 : (avgConfidence + avgClarity + avgTechnical) / 3)} label="Overall" size={120} />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Question-by-Question Review</h3>
                {results.map((result, i) => (
                    <div key={i} className="glass-card rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-gray-400">Question {i + 1}</span>
                                    {result.wasVoiceRecorded && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">🎤 Voice</span>}
                                </div>
                                <h4 className="text-white font-medium">{result.question}</h4>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                <div className="text-center"><div className="text-lg font-bold text-violet-400">{result.nlpAnalysis.confidenceScore}%</div><div className="text-xs text-gray-500">Confidence</div></div>
                                <div className="text-center"><div className="text-lg font-bold text-cyan-400">{result.nlpAnalysis.clarityScore}%</div><div className="text-xs text-gray-500">Clarity</div></div>
                                {result.evaluation && <div className="text-center"><div className="text-lg font-bold text-emerald-400">{result.evaluation.score}%</div><div className="text-xs text-gray-500">AI Score</div></div>}
                                {result.voiceAnalysis && <div className="text-center"><div className="text-lg font-bold text-amber-400">{Math.round(Number(result.voiceAnalysis.scores.overall_score))}%</div><div className="text-xs text-gray-500">Voice</div></div>}
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-white/5 mb-4"><p className="text-sm text-gray-300">{result.answer}</p></div>

                        {result.voiceAnalysis && (
                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 mb-4">
                                <p className="text-xs text-amber-400 font-medium mb-3">🎤 Voice Analysis</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                    <div className="text-center p-2 rounded-lg bg-white/5"><div className="text-sm font-bold text-amber-300">{Math.round(Number(result.voiceAnalysis.scores.confidence_score))}%</div><div className="text-xs text-gray-500">Voice Conf.</div></div>
                                    <div className="text-center p-2 rounded-lg bg-white/5"><div className="text-sm font-bold text-amber-300">{Math.round(Number(result.voiceAnalysis.scores.clarity_score))}%</div><div className="text-xs text-gray-500">Clarity</div></div>
                                    <div className="text-center p-2 rounded-lg bg-white/5"><div className="text-sm font-bold text-amber-300">{Math.round(result.voiceAnalysis.speech_speed?.words_per_minute || 0)}</div><div className="text-xs text-gray-500">WPM</div></div>
                                    <div className="text-center p-2 rounded-lg bg-white/5"><div className="text-sm font-bold text-amber-300">{result.voiceAnalysis.filler_analysis?.total_filler_words ?? 0}</div><div className="text-xs text-gray-500">Fillers</div></div>
                                </div>
                                <div className="flex gap-3 text-xs text-gray-400 flex-wrap mb-1">
                                    {result.voiceAnalysis.speech_speed?.pace && <span>Pace: <span className="text-amber-300">{result.voiceAnalysis.speech_speed.pace}</span></span>}
                                    {result.voiceAnalysis.sentiment_analysis?.label && <span>Tone: <span className="text-amber-300">{result.voiceAnalysis.sentiment_analysis.label}</span></span>}
                                </div>
                                {result.voiceAnalysis.suggestions?.slice(0, 3).map((s, si) => <p key={si} className="text-xs text-gray-400">• {s}</p>)}
                            </div>
                        )}

                        {result.nlpAnalysis.fillerWordCount > 0 && (
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span className="text-xs text-amber-400">Filler words:</span>
                                {result.nlpAnalysis.fillerWords.map((fw, fi) => <span key={fi} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300">&quot;{fw.word}&quot; ×{fw.count}</span>)}
                            </div>
                        )}

                        {result.evaluation && (
                            <div className="p-4 rounded-lg bg-violet-500/5 border border-violet-500/10 mb-3">
                                <p className="text-xs text-violet-400 font-medium mb-2">AI Feedback</p>
                                <p className="text-sm text-gray-300 mb-2">{result.evaluation.feedback}</p>
                                {result.evaluation.strengths && result.evaluation.strengths.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">{result.evaluation.strengths.map((s, si) => <span key={si} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">✓ {s}</span>)}</div>
                                )}
                                {result.evaluation.areasForImprovement?.map((a, ai) => <p key={ai} className="text-xs text-gray-400">• {a}</p>)}
                                {result.evaluation.keyPointsMissed && result.evaluation.keyPointsMissed.length > 0 && <p className="text-xs text-gray-500 mt-1">Missed: {result.evaluation.keyPointsMissed.join(', ')}</p>}
                            </div>
                        )}

                        {result.nlpAnalysis.suggestions.map((s, si) => (
                            <p key={si} className="text-xs text-gray-400 flex items-start gap-2 mt-1">
                                <LightBulbIcon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />{s}
                            </p>
                        ))}
                    </div>
                ))}
            </div>

            <button onClick={() => { setStep('setup'); setMode(''); setRole(''); setResults([]); }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2">
                <HiOutlinePlay className="w-5 h-5" />Start Another Interview
            </button>
        </div>
    );
}

function LightBulbIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
    );
}
