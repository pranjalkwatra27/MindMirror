'use client';

interface ScoreCircleProps {
    score: number;
    label: string;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export default function ScoreCircle({
    score,
    label,
    size = 120,
    strokeWidth = 8,
    color,
}: ScoreCircleProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    const getColor = () => {
        if (color) return color;
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#eab308';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    };

    const gradId = `grad-${label.replace(/\s+/g, '-')}`;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <defs>
                        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={getColor()} stopOpacity="1" />
                            <stop offset="100%" stopColor={getColor()} stopOpacity="0.5" />
                        </linearGradient>
                    </defs>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-white/10"
                    />
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
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{score}%</span>
                </div>
            </div>
            <span className="text-sm text-gray-400 font-medium">{label}</span>
        </div>
    );
}
