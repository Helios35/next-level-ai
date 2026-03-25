import { cn } from '@/utils/cn'
import { Building2, Home, MapPin, DollarSign, HardHat, Users } from 'lucide-react'
import type { DealRoom } from '@shared/types/dealRoom'
import type { AssetSubType, DealStage } from '@shared/types/enums'
import StatusBadge from './StatusBadge'
import MatchScoreRing from './MatchScoreRing'
import StageProgressBar from './StageProgressBar'

const ASSET_SUBTYPE_LABELS: Record<AssetSubType, string> = {
  build_for_rent: 'Build-for-Rent',
  sfr_portfolio: 'SFR Portfolio',
  multifamily: 'Multifamily',
  land: 'Land',
}

const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  pre_development: 'Pre-Development',
  in_development: 'In Development',
  delivered_vacant: 'Delivered Vacant',
  lease_up: 'Lease-Up',
  stabilized: 'Stabilized',
}

function formatPrice(deal: DealRoom): string {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${n.toLocaleString()}`

  if (deal.shared.pricingPosture === 'exact_price' && deal.shared.exactPrice) {
    return fmt(deal.shared.exactPrice)
  }
  if (deal.shared.priceRange) {
    return `${fmt(deal.shared.priceRange.min)}–${fmt(deal.shared.priceRange.max)}`
  }
  return 'Price TBD'
}

function getUnitCount(deal: DealRoom): number | undefined {
  if (!deal.unique) return undefined
  if ('unitCount' in deal.unique) return deal.unique.unitCount
  return undefined
}

interface DealCardProps {
  deal: DealRoom
  onViewDetails?: () => void
  onOpenDealRoom?: () => void
  className?: string
}

export default function DealCard({
  deal,
  onViewDetails,
  onOpenDealRoom,
  className,
}: DealCardProps) {
  const AssetIcon = deal.assetSubType === 'sfr_portfolio' ? Home : Building2
  const subtypeLabel = ASSET_SUBTYPE_LABELS[deal.assetSubType]
  const unitCount = getUnitCount(deal)
  const stageLabel = DEAL_STAGE_LABELS[deal.shared.dealStage]

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-mode-sell/30',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <AssetIcon size={16} />
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-snug">{deal.name}</h3>
        </div>
        <StatusBadge status={deal.status} className="shrink-0" />
      </div>

      {/* Asset sub-type line */}
      <p className="mt-2 text-xs text-muted-foreground">
        {subtypeLabel}
        {unitCount ? ` \u00B7 ${unitCount} units` : ''}
      </p>

      {/* Metadata row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate max-w-[120px]">{deal.shared.geography.msa.split(',')[0]}</span>
        </span>
        <span className="flex items-center gap-1">
          <DollarSign size={12} className="shrink-0" />
          {formatPrice(deal)}
        </span>
        <span className="flex items-center gap-1">
          <HardHat size={12} className="shrink-0" />
          {stageLabel}
        </span>
      </div>

      {/* Stage progress */}
      <div className="mt-4">
        <StageProgressBar currentStage={deal.currentStage} />
      </div>

      {/* Match score + buyer count */}
      <div className="mt-4 flex items-center gap-4">
        <MatchScoreRing score={deal.matchScore} size={40} strokeWidth={3} />
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users size={13} />
          {deal.matchedBuyerCount} matched buyers
        </span>
      </div>

      {/* Footer buttons */}
      <div className="mt-5 flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        >
          View Details
        </button>
        <button
          onClick={onOpenDealRoom}
          className="flex-1 rounded-lg bg-mode-sell px-3 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity"
        >
          Open Deal Room
        </button>
      </div>
    </div>
  )
}
