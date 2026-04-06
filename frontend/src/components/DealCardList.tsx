import { cn } from '@/utils/cn'
import { ASSET_SUBTYPE_LABELS, DEAL_STAGE_LABELS, formatPrice } from '@/utils/dealFormatters'
import { Building2, Home, DollarSign, HardHat, MapPin, Users } from 'lucide-react'
import type { DealRoom } from '@shared/types/dealRoom'
import StatusBadge from './StatusBadge'
import StageProgressBar from './StageProgressBar'

interface DealCardListProps {
  deal: DealRoom
  onViewDetails?: (e: React.MouseEvent<HTMLButtonElement>) => void
  onOpenDealRoom?: () => void
  className?: string
}

export default function DealCardList({
  deal,
  onViewDetails,
  onOpenDealRoom,
  className,
}: DealCardListProps) {
  const AssetIcon = deal.assetSubType === 'sfr_portfolio' ? Home : Building2
  const subtypeLabel = ASSET_SUBTYPE_LABELS[deal.assetSubType]
  const stageLabel = DEAL_STAGE_LABELS[deal.shared.dealStage]

  return (
    <div
      className={cn(
        'grid grid-cols-[260px_repeat(6,1fr)_auto] items-center rounded-lg border border-border bg-muted/30 py-3 pr-4 transition-colors hover:border-mode-sell/30',
        className,
      )}
    >
      {/* Icon + Name + Location — sticky so it stays visible when scrolling */}
      <div className="sticky left-0 z-10 bg-background rounded-l-lg">
        <div className="flex items-center gap-2.5 bg-muted/30 pl-4 py-px rounded-l-lg">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <AssetIcon size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground leading-snug truncate">
              {deal.name}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              <MapPin size={10} className="shrink-0" />
              {deal.shared.geography.msa.split(',')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="px-4">
        <StatusBadge status={deal.status} />
      </div>

      {/* Asset Type */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
        <Building2 size={12} className="shrink-0" />
        <span>{subtypeLabel}</span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
        <DollarSign size={12} className="shrink-0" />
        <span className="whitespace-nowrap">{formatPrice(deal)}</span>
      </div>

      {/* Development Stage */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
        <HardHat size={12} className="shrink-0" />
        <span>{stageLabel}</span>
      </div>

      {/* Stage Progress */}
      <div className="px-2">
        <StageProgressBar currentStage={deal.currentStage} showLabel={false} />
      </div>

      {/* Buyer Pool */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
        <Users size={13} />
        <span className="font-semibold text-foreground">{deal.matchedBuyerCount}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end pl-4">
        <button
          onClick={onViewDetails}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors whitespace-nowrap"
        >
          View Details
        </button>
        <button
          onClick={onOpenDealRoom}
          className="rounded-lg bg-mode-sell px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Open Deal Room
        </button>
      </div>
    </div>
  )
}
