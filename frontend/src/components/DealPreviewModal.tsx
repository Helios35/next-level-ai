import { Building2, Home, MapPin, DollarSign, HardHat, FileText, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ASSET_SUBTYPE_LABELS, DEAL_STAGE_LABELS, formatPrice } from '@/utils/dealFormatters'
import type { DealRoom } from '@shared/types/dealRoom'
import type { BuyerPoolEntry } from '@shared/types/buyerPool'
import { MOCK_DEAL_PREVIEW_SELLER, type DocumentUploadItem } from '@/data/mock/dealPreviews'
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

const BUYER_POOL_BY_DEAL: Record<string, BuyerPoolEntry[]> = {
  dr_001: MOCK_BUYER_POOL_DR001,
  dr_002: MOCK_BUYER_POOL_DR002,
  dr_005: MOCK_BUYER_POOL_DR005,
}

interface DealPreviewModalProps {
  deal: DealRoom | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenDealRoom: (dealId: string) => void
}

const DOC_STATUS_STYLES: Record<DocumentUploadItem['status'], { dot: string; label: string }> = {
  approved: { dot: 'bg-green-400', label: 'Approved' },
  uploaded: { dot: 'bg-blue-400', label: 'Uploaded' },
  under_review: { dot: 'bg-amber-400', label: 'Under Review' },
  flagged: { dot: 'bg-red-400', label: 'Flagged' },
  not_started: { dot: 'bg-muted-foreground/40', label: 'Not Started' },
}

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function DealPreviewModal({
  deal,
  open,
  onOpenChange,
  onOpenDealRoom,
}: DealPreviewModalProps) {
  if (!deal) return null

  const preview = MOCK_DEAL_PREVIEW_SELLER[deal.id]
  const AssetIcon = deal.assetSubType === 'sfr_portfolio' ? Home : Building2
  const subtypeLabel = ASSET_SUBTYPE_LABELS[deal.assetSubType]
  const stageLabel = DEAL_STAGE_LABELS[deal.shared.dealStage]

  function handleOpenDealRoom() {
    onOpenDealRoom(deal.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0">
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
            <StatusBadge status={deal.status} className="shrink-0" />
          </div>

          {/* Metadata row */}
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <span className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
              <DollarSign size={12} className="shrink-0" />
              <span className="truncate">{formatPrice(deal)}</span>
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
          {/* Buyer Funnel */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Buyer Funnel</h4>
            <BuyerFunnelStat buyers={BUYER_POOL_BY_DEAL[deal.id] ?? []} />
          </div>

          {/* Stage Progress */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Stage Progress</h4>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <StageProgressBar currentStage={deal.currentStage} showLabel />
            </div>
          </div>

          {/* Buyer Activity Feed */}
          {(() => {
            const buyers = BUYER_POOL_BY_DEAL[deal.id] ?? []
            const events: { label: string; detail?: string; date: Date }[] = []

            for (const b of buyers) {
              if (b.accessRequestedAt) {
                events.push({
                  label: `${b.anonymizedLabel} requested access`,
                  date: new Date(b.accessRequestedAt),
                })
              }
              if (b.passedAt) {
                events.push({
                  label: `${b.anonymizedLabel} passed`,
                  detail: b.passReason,
                  date: new Date(b.passedAt),
                })
              }
            }

            events.sort((a, b) => b.date.getTime() - a.date.getTime())

            if (events.length === 0) return null

            return (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Buyer Activity</h4>
                <div className="rounded-lg border border-border divide-y divide-border">
                  {events.slice(0, 5).map((event, i) => (
                    <div key={i} className="flex items-start gap-2.5 px-4 py-2.5">
                      <Clock size={12} className="shrink-0 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">{event.label}</p>
                        {event.detail && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{event.detail}</p>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {formatRelativeTime(event.date.toISOString())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Documents */}
          {preview && preview.documents.length > 0 && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Documents</h4>
              <div className="rounded-lg border border-border divide-y divide-border">
                {preview.documents.map((doc) => {
                  const style = DOC_STATUS_STYLES[doc.status]
                  return (
                    <div key={doc.type} className="flex items-center gap-3 px-4 py-2.5">
                      <div className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                        doc.status === 'not_started'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-mode-sell/10 text-mode-sell',
                      )}>
                        <FileText size={14} />
                      </div>
                      <span className="flex-1 text-sm text-foreground truncate">{doc.label}</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                        <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
                        {style.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <DialogFooter>
          <button
            onClick={handleOpenDealRoom}
            className="w-full rounded-lg bg-mode-sell px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Open Deal Room
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
