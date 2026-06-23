// Client-side NLP analysis for confidence and communication scoring

const FILLER_WORDS = [
    'uh', 'um', 'like', 'you know', 'basically', 'actually', 'literally',
    'i mean', 'sort of', 'kind of', 'so like', 'well', 'i think', 'i feel',
    'you see', 'right', 'okay', 'so', 'anyway', 'also', 'maybe', 'perhaps'
];

const CONFIDENCE_KEYWORDS = [
    'confident', 'sure', 'definitely', 'absolutely', 'clearly', 'obviously',
    'strong', 'excellent', 'achieve', 'delivered', 'successfully', 'expert',
    'proficient', 'skilled', 'experienced', 'talented', 'resolved', 'built',
    'created', 'implemented', 'designed', 'optimized', 'improved', 'led'
];

const HESITATION_KEYWORDS = [
    'maybe', 'perhaps', 'not sure', 'unsure', 'unclear', 'difficult', 'wrong',
    'confused', 'stuck', 'lost', 'uncertain', 'doubt', 'problem', 'i guess',
    'probably', 'might', 'could be', 'not really'
];

export interface AnalysisResult {
    confidenceScore: number;
    clarityScore: number;
    fillerWordCount: number;
    fillerWords: { word: string; count: number }[];
    sentenceCount: number;
    wordCount: number;
    avgWordsPerSentence: number;
    suggestions: string[];
}

export function analyzeText(text: string): AnalysisResult {
    if (!text || text.trim().length === 0) {
        return {
            confidenceScore: 0,
            clarityScore: 0,
            fillerWordCount: 0,
            fillerWords: [],
            sentenceCount: 0,
            wordCount: 0,
            avgWordsPerSentence: 0,
            suggestions: ['Please provide an answer to analyze.'],
        };
    }

    const lowerText = text.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = Math.max(sentences.length, 1);
    const avgWordsPerSentence = wordCount / sentenceCount;

    // Filler word analysis
    let totalFillerCount = 0;
    const fillerWords: { word: string; count: number }[] = [];

    FILLER_WORDS.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            totalFillerCount += matches.length;
            fillerWords.push({ word, count: matches.length });
        }
    });

    const fillerPercentage = wordCount > 0 ? (totalFillerCount / wordCount) * 100 : 0;

    // Confidence analysis
    let confidenceCount = 0;
    let hesitationCount = 0;

    CONFIDENCE_KEYWORDS.forEach(kw => {
        const matches = lowerText.match(new RegExp(`\\b${kw}\\b`, 'gi'));
        if (matches) confidenceCount += matches.length;
    });

    HESITATION_KEYWORDS.forEach(kw => {
        const matches = lowerText.match(new RegExp(`\\b${kw}\\b`, 'gi'));
        if (matches) hesitationCount += matches.length;
    });

    // Calculate confidence score
    let confidenceScore = 50;
    confidenceScore += confidenceCount * 5;
    confidenceScore -= hesitationCount * 4;
    confidenceScore -= totalFillerCount * 2;

    // Bonus for longer, more detailed answers
    if (wordCount > 50) confidenceScore += 10;
    if (wordCount > 100) confidenceScore += 5;

    confidenceScore = Math.min(100, Math.max(0, confidenceScore));

    // Calculate clarity score
    let clarityScore = 80;
    clarityScore -= fillerPercentage * 3;

    // Penalize very short or very long sentences
    if (avgWordsPerSentence > 30) clarityScore -= 15;
    if (avgWordsPerSentence < 5 && sentenceCount > 1) clarityScore -= 10;

    // Penalize very short answers
    if (wordCount < 10) clarityScore -= 20;
    if (wordCount < 5) clarityScore -= 20;

    clarityScore = Math.min(100, Math.max(0, clarityScore));

    // Generate suggestions
    const suggestions: string[] = [];

    if (totalFillerCount > 5) {
        suggestions.push(`Reduce filler words — you used ${totalFillerCount} filler words. Replace "I think" or "like" with confident statements.`);
    }
    if (totalFillerCount > 0 && totalFillerCount <= 5) {
        suggestions.push(`Minor filler words detected (${totalFillerCount}). Try to eliminate "um", "like", and "I think" from responses.`);
    }
    if (hesitationCount > 2) {
        suggestions.push('Avoid hesitation language like "maybe", "perhaps", "not sure". Use assertive statements instead.');
    }
    if (wordCount < 20) {
        suggestions.push('Your answer is too brief. Elaborate more with examples, metrics, and specific details.');
    }
    if (avgWordsPerSentence > 25) {
        suggestions.push('Your sentences are too long. Break them into shorter, clearer statements for better impact.');
    }
    if (confidenceScore < 60) {
        suggestions.push('Sound more confident — use action verbs like "built", "designed", "implemented", "delivered".');
    }
    if (suggestions.length === 0) {
        suggestions.push('Great answer! Clear, confident, and well-structured.');
    }

    return {
        confidenceScore: Math.round(confidenceScore),
        clarityScore: Math.round(clarityScore),
        fillerWordCount: totalFillerCount,
        fillerWords: fillerWords.filter(f => f.count > 0),
        sentenceCount,
        wordCount,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        suggestions,
    };
}
