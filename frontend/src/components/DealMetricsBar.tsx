import { cn } from '@/utils/cn'
import { Users } from 'lucide-react'
import type { DealRoomStage } from '@shared/types/enums'
import StageProgressBar from './StageProgressBar'

interface DealMetricsBarProps {
  currentStage: DealRoomStage
  buyerPoolCount: number
  size?: 'sm' | 'default'
  className?: string
}

export default function DealMetricsBar({
  currentStage,
  buyerPoolCount,
  size = 'default',
  className,
}: DealMetricsBarProps) {
  const isSmall = size === 'sm'

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border border-border bg-muted/30 shadow-sm px-4 py-2.5',
        className,
      )}
    >
      <div className={isSmall ? 'flex-1 min-w-0' : 'w-44'}>
        <StageProgressBar currentStage={currentStage} />
      </div>
      <div className="h-8 w-px bg-border shrink-0" />
      <div
        className={cn(
          'flex items-center gap-1.5 shrink-0 rounded-md bg-mode-sell/15 text-mode-sell',
          isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        )}
      >
        <Users size={isSmall ? 13 : 15} />
        <span className="font-bold tabular-nums">{buyerPoolCount}</span>
        <span className="font-medium">Buyer Pool</span>
      </div>
    </div>
  )
}
