import { useState } from 'react'
import { cn } from '@/utils/cn'
import { ASSET_SUBTYPE_LABELS, DEAL_STAGE_LABELS, formatPrice } from '@/utils/dealFormatters'
import { Building2, Home, DollarSign, HardHat, MapPin } from 'lucide-react'
import type { DealRoom } from '@shared/types/dealRoom'
import type { BuyerCtaState } from '@shared/types/buyerStrategy'
import StatusBadge from './StatusBadge'
import DealMetricsBar from './DealMetricsBar'
import MatchScoreRing from './MatchScoreRing'
import { InfoPopover } from './ui/info-popover'

function getUnitCount(deal: DealRoom): number | undefined {
  if (!deal.unique) return undefined
  if ('unitCount' in deal.unique) return deal.unique.unitCount
  return undefined
}

const BUYER_CTA_MAP: Record<BuyerCtaState, { label: string; enabled: boolean }> = {
  coming_soon: { label: 'Indicate Interest', enabled: true },
  request_access: { label: 'Request Access', enabled: true },
  access_pending: { label: 'Access Pending', enabled: false },
  wait_queue: { label: 'Wait Queue', enabled: false },
  enter_deal_room: { label: 'Enter Deal Room', enabled: true },
}

interface DealCardProps {
  deal: DealRoom
  onViewDetails?: (e: React.MouseEvent<HTMLButtonElement>) => void
  onOpenDealRoom?: () => void
  onRequestAccess?: () => void
  className?: string
  mode?: 'sell' | 'buy'
  buyerCtaState?: BuyerCtaState
  matchScore?: number
}

export default function DealCard({
  deal,
  onViewDetails,
  onOpenDealRoom,
  onRequestAccess,
  className,
  mode = 'sell',
  buyerCtaState,
  matchScore,
}: DealCardProps) {
  const isBuy = mode === 'buy'
  const [optimisticLabel, setOptimisticLabel] = useState<string | null>(null)
  const [optimisticDisabled, setOptimisticDisabled] = useState(false)

  const AssetIcon = deal.assetSubType === 'sfr_portfolio' ? Home : Building2
  const subtypeLabel = ASSET_SUBTYPE_LABELS[deal.assetSubType]
  const unitCount = getUnitCount(deal)
  const stageLabel = DEAL_STAGE_LABELS[deal.shared.dealStage]

  const priceBlurred = isBuy && buyerCtaState !== 'enter_deal_room'

  function handleBuyerCtaClick() {
    if (!buyerCtaState) return
    if (buyerCtaState === 'coming_soon') {
      setOptimisticLabel('Interested ✓')
      setOptimisticDisabled(true)
    } else if (buyerCtaState === 'request_access') {
      if (onRequestAccess) {
        onRequestAccess()
        return
      }
      setOptimisticLabel('Request Sent')
      setOptimisticDisabled(true)
    } else if (buyerCtaState === 'enter_deal_room') {
      onOpenDealRoom?.()
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-border bg-muted/30 shadow-sm p-5 transition-colors',
        isBuy ? 'hover:border-mode-buy/30' : 'hover:border-mode-sell/30',
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
        {isBuy && matchScore != null ? (
          <MatchScoreRing score={matchScore} colorMode="buy" size={40} className="shrink-0" />
        ) : (
          <StatusBadge status={deal.status} className="shrink-0" />
        )}
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
          <span className={cn('truncate', priceBlurred && 'blur-sm select-none pointer-events-none')}>
            {formatPrice(deal)}
          </span>
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

      {/* Deal metrics — seller only */}
      {!isBuy && (
        <DealMetricsBar
          currentStage={deal.currentStage}
          buyerPoolCount={deal.matchedBuyerCount}
          size="sm"
          className="mt-5"
        />
      )}

      {/* Action buttons */}
      <div className="mt-5 flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        >
          View Details
        </button>
        {isBuy && buyerCtaState ? (
          <button
            onClick={handleBuyerCtaClick}
            disabled={optimisticDisabled || !BUYER_CTA_MAP[buyerCtaState].enabled}
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-opacity',
              optimisticDisabled || !BUYER_CTA_MAP[buyerCtaState].enabled
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-mode-buy text-white hover:opacity-90',
            )}
          >
            {optimisticLabel ?? BUYER_CTA_MAP[buyerCtaState].label}
          </button>
        ) : (
          <button
            onClick={onOpenDealRoom}
            className="flex-1 rounded-lg bg-mode-sell px-3 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity"
          >
            Open Deal Room
          </button>
        )}
      </div>
    </div>
  )
}
