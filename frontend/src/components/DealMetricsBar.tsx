import { cn } from '@/utils/cn'
import { Users } from 'lucide-react'
import type { DealRoomStage } from '@shared/types/enums'
import StageProgressBar from './StageProgressBar'

interface DealMetricsBarProps {
  currentStage: DealRoomStage
  buyerPoolCount: number
  seatedBuyerCount?: number
  maxSeats?: number
  size?: 'sm' | 'default'
  mode?: 'sell' | 'buy'
  className?: string
}

export default function DealMetricsBar({
  currentStage,
  buyerPoolCount,
  seatedBuyerCount,
  maxSeats = 3,
  size = 'default',
  mode = 'sell',
  className,
}: DealMetricsBarProps) {
  const isSmall = size === 'sm'
  const isBuy = mode === 'buy'

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border border-border bg-muted/30 shadow-sm px-4 py-2.5',
        className,
      )}
    >
      <div className={isSmall ? 'flex-1 min-w-0' : 'w-44'}>
        <StageProgressBar currentStage={currentStage} buyerView={isBuy} />
      </div>
      <div className="h-8 w-px bg-border shrink-0" />
      {isBuy && seatedBuyerCount !== undefined ? (
        <div
          className={cn(
            'flex items-center gap-1.5 shrink-0 rounded-md',
            'bg-mode-buy/15 text-mode-buy',
            isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
          )}
        >
          <Users size={isSmall ? 13 : 15} />
          <span className="font-bold tabular-nums">{seatedBuyerCount}</span>
          <span className="font-medium">Buyers in Deal</span>
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center gap-1.5 shrink-0 rounded-md',
            isBuy ? 'bg-mode-buy/15 text-mode-buy' : 'bg-mode-sell/15 text-mode-sell',
            isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
          )}
        >
          <Users size={isSmall ? 13 : 15} />
          <span className="font-bold tabular-nums">{buyerPoolCount}</span>
          <span className="font-medium">Buyer Pool</span>
        </div>
      )}
    </div>
  )
}
