import { cn } from '@/utils/cn'
import { ASSET_SUBTYPE_LABELS, DEAL_STAGE_LABELS, formatPrice } from '@/utils/dealFormatters'
import { Building2, Home, DollarSign, HardHat, MapPin } from 'lucide-react'
import type { DealRoom } from '@shared/types/dealRoom'
import StatusBadge from './StatusBadge'
import DealMetricsBar from './DealMetricsBar'
import { InfoPopover } from './ui/info-popover'

function getUnitCount(deal: DealRoom): number | undefined {
  if (!deal.unique) return undefined
  if ('unitCount' in deal.unique) return deal.unique.unitCount
  return undefined
}

interface DealCardProps {
  deal: DealRoom
  onViewDetails?: (e: React.MouseEvent<HTMLButtonElement>) => void
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
        'flex flex-col rounded-lg border border-border bg-muted/30 p-5 transition-colors hover:border-mode-sell/30',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <AssetIcon size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-semibold text-foreground leading-snug">{deal.name}</h3>
            <InfoPopover
              label="Location (MSA)"
              value={deal.shared.geography.msa}
              icon={<MapPin size={12} />}
            >
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {deal.shared.geography.msa.split(',')[0]}
              </p>
            </InfoPopover>
          </div>
        </div>
        <StatusBadge status={deal.status} className="shrink-0" />
      </div>

      {/* Metadata row */}
      <div className="mt-4 flex items-center gap-3 sm:gap-4 rounded-lg border border-border bg-muted/30 px-3 sm:px-4 py-2.5 text-xs text-muted-foreground">
        <InfoPopover
          label="Property Type"
          value={`${subtypeLabel}${unitCount ? ` · ${unitCount} units` : ''}`}
          icon={<Building2 size={12} />}
          className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 min-w-0"
        >
          <Building2 size={12} className="shrink-0" />
          <span className="truncate">{subtypeLabel}{unitCount ? ` · ${unitCount}` : ''}</span>
        </InfoPopover>
        <div className="h-8 w-px bg-border shrink-0" />
        <InfoPopover
          label="Price"
          value={formatPrice(deal)}
          icon={<DollarSign size={12} />}
          className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 min-w-0"
        >
          <DollarSign size={12} className="shrink-0" />
          <span className="truncate">{formatPrice(deal)}</span>
        </InfoPopover>
        <div className="h-8 w-px bg-border shrink-0" />
        <InfoPopover
          label="Development Stage"
          value={stageLabel}
          icon={<HardHat size={12} />}
          className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 min-w-0"
        >
          <HardHat size={12} className="shrink-0" />
          <span className="truncate">{stageLabel}</span>
        </InfoPopover>
      </div>

      {/* Deal metrics */}
      <DealMetricsBar
        currentStage={deal.currentStage}
        matchScore={deal.matchScore}
        matchedBuyerCount={deal.matchedBuyerCount}
        showMatchScore={false}
        size="sm"
        className="mt-5"
      />

      {/* Action buttons */}
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
