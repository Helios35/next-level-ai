import { Users } from 'lucide-react'
import type { BuyerPoolEntry } from '@shared/types/buyerPool'
import { cn } from '@/utils/cn'
import { Badge } from '@/components/ui/badge'
import { InfoCallout } from '@/components/ui/info-callout'
import SeatedBuyerItem from '@/components/SeatedBuyerItem'

interface BuyerPoolPanelProps {
  buyers: BuyerPoolEntry[]
  className?: string
}

export default function BuyerPoolPanel({ buyers, className }: BuyerPoolPanelProps) {
  const seated = buyers.filter((b) => b.seatStatus === 'seated')

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section heading */}
      <div className="flex items-center gap-2">
        <Users size={16} className="text-mode-buy" />
        <h3 className="text-sm font-semibold text-foreground">Buyer Pool</h3>
      </div>

      {/* Seats badge */}
      <Badge size="sm" className="border-transparent bg-mode-buy/15 text-mode-buy">
        {seated.length} of 3 Seats Filled
      </Badge>

      {/* Seated buyers */}
      {seated.length > 0 && (
        <div className="flex flex-col gap-2">
          {seated.map((buyer) => (
            <SeatedBuyerItem
              key={buyer.id}
              label={buyer.isCurrentUser ? `You — ${buyer.anonymizedLabel}` : buyer.anonymizedLabel}
              rank={buyer.aiRankPosition ?? 0}
              qualified={buyer.qualificationStatus === 'qualified'}
              score={buyer.matchScore}
              equity={buyer.equityCheckSize}
              activity={`Match score ${buyer.matchScore} · ${buyer.equityCheckSize} equity`}
              colorMode="buy"
              className={cn(
                'flex-nowrap px-4 py-3',
                buyer.isCurrentUser && 'border-mode-buy/40',
              )}
            />
          ))}
        </div>
      )}

      {/* Info callout */}
      <InfoCallout>
        Seat allocation is managed by the Disposition Specialist. Buyers are seated based on match quality, qualification status, and DS judgment. Maximum 3 concurrent seats.
      </InfoCallout>
    </div>
  )
}
