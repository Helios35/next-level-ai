import { cn } from '@/utils/cn'
import { Users } from 'lucide-react'
import type { DealRoomStage } from '@shared/types/enums'
import StageProgressBar from './StageProgressBar'
import MatchScoreRing from './MatchScoreRing'
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover'

interface DealMetricsBarProps {
  currentStage: DealRoomStage
  matchScore?: number
  matchedBuyerCount: number
  showMatchScore?: boolean
  size?: 'sm' | 'default'
  className?: string
}

export default function DealMetricsBar({
  currentStage,
  matchScore,
  matchedBuyerCount,
  showMatchScore = true,
  size = 'default',
  className,
}: DealMetricsBarProps) {
  const isSmall = size === 'sm'

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border border-border bg-muted/30 px-4 py-2.5',
        className,
      )}
    >
      <div className={isSmall ? 'flex-1 min-w-0' : 'w-44'}>
        <StageProgressBar currentStage={currentStage} />
      </div>
      <div className="h-8 w-px bg-border shrink-0" />
      {showMatchScore && matchScore != null && (
        <>
          <MatchScoreRing
            score={matchScore}
            size={isSmall ? 40 : 44}
            strokeWidth={isSmall ? 3 : 3.5}
          />
          <div className="h-8 w-px bg-border shrink-0" />
        </>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex items-center gap-1.5 text-muted-foreground shrink-0 cursor-pointer rounded-md px-1.5 py-1 -mx-1.5 -my-1 transition-colors hover:text-foreground hover:bg-muted/50',
              isSmall ? 'text-xs' : 'text-sm',
            )}
          >
            <Users size={isSmall ? 13 : 15} />
            <span className="font-semibold text-foreground">{matchedBuyerCount}</span>
            Buyers
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Buyer Pool
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{matchedBuyerCount} Buyers</span>
            </div>
            {matchScore != null && (
              <>
                <div className="h-px bg-border" />
                <div className="flex items-center gap-2">
                  <MatchScoreRing score={matchScore} size={32} strokeWidth={2.5} />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Match Score
                    </p>
                    <p className="text-sm font-semibold text-foreground">{matchScore}%</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
