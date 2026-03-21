import { toArabicNum } from "@/utils/arabicUtils";

interface HealthScoreRingProps {
  score: number;
  totalMembers: number;
}

export function HealthScoreRing({ score, totalMembers }: HealthScoreRingProps) {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colorClass =
    score >= 80
      ? "text-green-500"
      : score >= 50
        ? "text-amber-500"
        : "text-destructive";

  const strokeColor =
    score >= 80
      ? "hsl(142, 71%, 45%)"
      : score >= 50
        ? "hsl(38, 92%, 50%)"
        : "hsl(var(--destructive))";

  return (
    <div className="flex flex-col items-center gap-2" dir="rtl">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div
        className="absolute flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className={`text-2xl font-bold ${colorClass}`}>
          {toArabicNum(score)}٪
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        من أصل {toArabicNum(totalMembers)} عضو
      </p>
    </div>
  );
}
