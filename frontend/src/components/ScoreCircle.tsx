'use client';

interface ScoreCircleProps {
    score: number;
    label: string;
    size?: number;
    strokeWidth?: number;
    color?: string;
    sublabel?: string;
}

export default function ScoreCircle({
    score,
    label,
    size = 120,
    strokeWidth = 7,
    color,
    sublabel,
}: ScoreCircleProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const clampedScore = Math.max(0, Math.min(100, Math.round(score || 0)));
    const offset = circumference - (clampedScore / 100) * circumference;

    const getColor = () => {
        if (color) return color;
        if (clampedScore >= 80) return '#34d399'; // Emerald
        if (clampedScore >= 65) return '#6366f1'; // Indigo
        if (clampedScore >= 50) return '#38bdf8'; // Cyan
        if (clampedScore >= 35) return '#fbbf24'; // Amber
        return '#f87171'; // Red
    };

    const activeColor = getColor();
    const gradId = `score-grad-${label.replace(/[^a-zA-Z0-9]/g, '-')}-${size}`;

    return (
        <div className="flex flex-col items-center gap-2 group">
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <defs>
                        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={activeColor} stopOpacity="1" />
                            <stop offset="100%" stopColor={activeColor} stopOpacity="0.65" />
                        </linearGradient>
                        <filter id={`glow-${gradId}`} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    {/* Background Track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.06)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress Track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={`url(#${gradId})`}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        filter={`url(#glow-${gradId})`}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Score Number in Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                    <span className="font-mono-metric font-bold text-white tracking-tight" style={{ fontSize: size * 0.26 }}>
                        {clampedScore}
                        <span className="text-[0.6em] text-slate-400 font-normal ml-0.5">%</span>
                    </span>
                    {sublabel && (
                        <span className="text-[10px] text-slate-400 -mt-0.5">{sublabel}</span>
                    )}
                </div>
            </div>

            {label && (
                <span className="text-xs font-medium text-slate-300 text-center tracking-wide group-hover:text-white transition-colors">
                    {label}
                </span>
            )}
        </div>
    );
}
