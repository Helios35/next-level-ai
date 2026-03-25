import { cn } from '@/utils/cn'

interface MatchScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
}

export default function MatchScoreRing({
  score,
  size = 48,
  strokeWidth = 3.5,
  className,
}: MatchScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const center = size / 2

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Score arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-mode-sell)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute text-xs font-semibold text-foreground">
        {score}%
      </span>
    </div>
  )
}
