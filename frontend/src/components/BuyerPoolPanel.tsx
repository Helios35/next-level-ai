import { Users } from 'lucide-react'
import type { BuyerPoolEntry } from '@shared/types/buyerPool'
import { SectionCard } from '@/components/ui/section-card'
import { Item, ItemContent, ItemTitle, ItemDescription } from '@/components/ui/item'

interface BuyerPoolPanelProps {
  buyers: BuyerPoolEntry[]
  className?: string
}

export default function BuyerPoolPanel({ buyers, className }: BuyerPoolPanelProps) {
  const seatedBuyers = buyers
    .filter((b) => b.seatStatus === 'seated')
    .sort((a, b) => (a.aiRankPosition ?? 99) - (b.aiRankPosition ?? 99))

  const seatedCount = seatedBuyers.length

  return (
    <SectionCard icon={Users} iconClassName="text-mode-buy" title="Buyers in Room" className={className}>
      <div className="space-y-1">
        {seatedBuyers.map((buyer, index) => {
          const label = buyer.isCurrentUser
            ? `You \u2014 Seat ${index + 1} of ${seatedCount}`
            : `Investor #${buyer.buyerId.slice(-4)}`

          return (
            <Item key={buyer.id} size="sm">
              <ItemContent>
                <ItemTitle className={buyer.isCurrentUser ? 'text-mode-buy font-semibold' : undefined}>
                  {label}
                </ItemTitle>
                <ItemDescription>
                  Seat {index + 1} of {seatedCount}
                </ItemDescription>
              </ItemContent>
            </Item>
          )
        })}
      </div>
    </SectionCard>
  )
}
