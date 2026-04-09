import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Building2, Home, MapPin, DollarSign, HardHat } from 'lucide-react'
import { ASSET_SUBTYPE_LABELS, DEAL_STAGE_LABELS, formatPrice } from '@/utils/dealFormatters'
import type { DealRoom } from '@shared/types/dealRoom'
import type { BuyerPoolEntry } from '@shared/types/buyerPool'
import type { BuyerCtaState } from '@shared/types/buyerStrategy'
import { MOCK_BUYER_POOL_DR001, MOCK_BUYER_POOL_DR002, MOCK_BUYER_POOL_DR005 } from '@/data/mock/buyerPool'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from './ui/dialog'
import StatusBadge from './StatusBadge'
import StageProgressBar from './StageProgressBar'
import BuyerFunnelStat from './BuyerFunnelStat'
import MatchScoreRing from './MatchScoreRing'

const BUYER_POOL_BY_DEAL: Record<string, BuyerPoolEntry[]> = {
  dr_001: MOCK_BUYER_POOL_DR001,
  dr_002: MOCK_BUYER_POOL_DR002,
  dr_005: MOCK_BUYER_POOL_DR005,
}

const BUYER_CTA_MAP: Record<BuyerCtaState, { label: string; enabled: boolean }> = {
  coming_soon: { label: 'Indicate Interest', enabled: true },
  request_access: { label: 'Request Access', enabled: true },
  access_pending: { label: 'Access Pending', enabled: false },
  wait_queue: { label: 'Wait Queue', enabled: false },
  enter_deal_room: { label: 'Enter Deal Room', enabled: true },
}

interface DealPreviewModalProps {
  deal: DealRoom | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenDealRoom: (dealId: string) => void
  viewer?: 'seller' | 'buyer'
  buyerCtaState?: BuyerCtaState
  matchScore?: number
}

export default function DealPreviewModal({
  deal,
  open,
  onOpenChange,
  onOpenDealRoom,
  viewer = 'seller',
  buyerCtaState,
  matchScore,
}: DealPreviewModalProps) {
  const isBuyer = viewer === 'buyer'
  const [optimisticLabel, setOptimisticLabel] = useState<string | null>(null)
  const [optimisticDisabled, setOptimisticDisabled] = useState(false)

  if (!deal) return null

  const AssetIcon = deal.assetSubType === 'sfr_portfolio' ? Home : Building2
  const subtypeLabel = ASSET_SUBTYPE_LABELS[deal.assetSubType]
  const stageLabel = DEAL_STAGE_LABELS[deal.shared.dealStage]
  const priceBlurred = isBuyer && buyerCtaState !== 'enter_deal_room'

  function handleOpenDealRoom() {
    onOpenDealRoom(deal.id)
    onOpenChange(false)
  }

  function handleBuyerCtaClick() {
    if (!buyerCtaState) return
    if (buyerCtaState === 'coming_soon') {
      setOptimisticLabel('Interested ✓')
      setOptimisticDisabled(true)
    } else if (buyerCtaState === 'request_access') {
      setOptimisticLabel('Request Sent')
      setOptimisticDisabled(true)
    } else if (buyerCtaState === 'enter_deal_room') {
      handleOpenDealRoom()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0">
        {/* Header */}
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <AssetIcon size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <DialogTitle className="text-lg font-semibold leading-snug">
                  {deal.name}
                </DialogTitle>
                <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin size={11} className="shrink-0" />
                  {deal.shared.geography.msa.split(',')[0]}
                </span>
              </div>
            </div>
            {isBuyer && matchScore != null ? (
              <MatchScoreRing score={matchScore} colorMode="buy" size={48} className="shrink-0" />
            ) : (
              <StatusBadge status={deal.status} className="shrink-0" />
            )}
          </div>

          {/* Metadata row */}
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <span className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
              <DollarSign size={12} className="shrink-0" />
              <span className={cn('truncate', priceBlurred && 'blur-sm select-none pointer-events-none')}>
                {formatPrice(deal)}
              </span>
            </span>
            <div className="h-6 w-px bg-border shrink-0" />
            <span className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
              <Building2 size={12} className="shrink-0" />
              <span className="truncate">{subtypeLabel}</span>
            </span>
            <div className="h-6 w-px bg-border shrink-0" />
            <span className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
              <HardHat size={12} className="shrink-0" />
              <span className="truncate">{stageLabel}</span>
            </span>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="space-y-4 px-5 pb-5">
          {/* Buyer Funnel — seller only */}
          {!isBuyer && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Buyer Funnel</h4>
              <BuyerFunnelStat buyers={BUYER_POOL_BY_DEAL[deal.id] ?? []} />
            </div>
          )}

          {/* Stage Progress */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Stage Progress</h4>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <StageProgressBar currentStage={deal.currentStage} showLabel buyerView={isBuyer} />
            </div>
          </div>

        </div>

        {/* Footer CTA */}
        <DialogFooter>
          {isBuyer && buyerCtaState ? (
            <button
              onClick={handleBuyerCtaClick}
              disabled={optimisticDisabled || !BUYER_CTA_MAP[buyerCtaState].enabled}
              className={cn(
                'w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity',
                optimisticDisabled || !BUYER_CTA_MAP[buyerCtaState].enabled
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-mode-buy text-white hover:opacity-90',
              )}
            >
              {optimisticLabel ?? BUYER_CTA_MAP[buyerCtaState].label}
            </button>
          ) : (
            <button
              onClick={handleOpenDealRoom}
              className="w-full rounded-lg bg-mode-sell px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Open Deal Room
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
