import { Layers } from 'lucide-react'
import { SectionCard } from '@/components/ui/section-card'
import DealCard from '@/components/DealCard'
import BuyerEmptyState from '@/components/BuyerEmptyState'
import type { DealRoom } from '@shared/types/dealRoom'

interface ActiveDealRoomsCalloutProps {
  deals: DealRoom[]
  strategyName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenDealRoom?: (dealId: string) => void
}

export default function ActiveDealRoomsCallout({
  deals,
  strategyName,
  open,
  onOpenChange,
  onOpenDealRoom,
}: ActiveDealRoomsCalloutProps) {
  return (
    <SectionCard
      icon={Layers}
      iconClassName="text-mode-strategy"
      title="Active Deal Rooms Matching This Strategy"
      open={open}
      onOpenChange={onOpenChange}
    >
      {deals.length === 0 ? (
        <BuyerEmptyState variant="no-matches" accentMode="strategy" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              mode="buy"
              buyerCtaState="enter_deal_room"
              onOpenDealRoom={() => onOpenDealRoom?.(deal.id)}
            />
          ))}
        </div>
      )}
    </SectionCard>
  )
}
