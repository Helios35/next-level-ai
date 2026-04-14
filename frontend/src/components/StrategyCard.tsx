import { cn } from '@/utils/cn'
import { Building2, Home, Mountain, MapPin, DollarSign, Clock, DoorOpen } from 'lucide-react'
import type { BuyerStrategy } from '@shared/types/buyerStrategy'

// ── Status badge config ────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  broadcasting: { label: 'Broadcasting', classes: 'bg-green-500/20 text-green-400' },
  paused: { label: 'Paused', classes: 'bg-gray-500/20 text-gray-400' },
  draft: { label: 'Draft', classes: 'bg-slate-500/20 text-slate-400' },
}

// ── Friendly labels ────────────────────────────────────────────────────────

const SUBTYPE_LABELS: Record<string, string> = {
  sfr_portfolio: 'SFR Portfolio',
  build_for_rent: 'Build for Rent',
  bfr: 'Build for Rent',
  multifamily: 'Multifamily',
  land: 'Land',
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  residential: 'Residential Income',
  residential_income: 'Residential Income',
  land: 'Land',
}

function formatDealSize(min?: number, max?: number): string {
  const fmt = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
    return `$${v}`
  }
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`
  if (min != null) return `${fmt(min)}+`
  if (max != null) return `Up to ${fmt(max)}`
  return '—'
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}mo ago`
}

function getAssetIcon(assetSubType: string) {
  if (assetSubType === 'sfr_portfolio') return Home
  if (assetSubType === 'land') return Mountain
  return Building2
}

// ── Component ──────────────────────────────────────────────────────────────

interface StrategyCardProps {
  strategy: BuyerStrategy
  onEdit?: () => void
  onPause?: () => void
  onResume?: () => void
  onViewDealRooms?: () => void
  className?: string
}

export default function StrategyCard({
  strategy,
  onEdit,
  onPause,
  onResume,
  onViewDealRooms,
  className,
}: StrategyCardProps) {
  const badge = STATUS_BADGE[strategy.status] ?? STATUS_BADGE.draft
  const subtypeLabel = SUBTYPE_LABELS[strategy.assetSubType] ?? strategy.assetSubType
  const assetTypeLabel = ASSET_TYPE_LABELS[strategy.assetType] ?? strategy.assetType
  const geography = (strategy.sharedCriteria?.geography as string) ?? '—'
  const dealSizeMin = strategy.sharedCriteria?.dealSizeMin as number | undefined
  const dealSizeMax = strategy.sharedCriteria?.dealSizeMax as number | undefined
  const AssetIcon = getAssetIcon(strategy.assetSubType)

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-border bg-card shadow-sm p-5 transition-colors hover:border-mode-strategy/30',
        className,
      )}
    >
      {/* Header — icon, name, asset type, status badge */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mode-strategy/10">
          <AssetIcon size={16} className="text-mode-strategy" />
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground leading-snug truncate">
              {strategy.name}
            </h3>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0',
                badge.classes,
              )}
            >
              {badge.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{assetTypeLabel}</span>
            <span className="inline-flex items-center rounded-full bg-mode-strategy/10 px-2 py-0.5 text-xs font-medium text-mode-strategy">
              {subtypeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Labeled metadata fields */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-start gap-2">
          <DollarSign size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Price Range</p>
            <p className="text-sm font-medium text-foreground truncate">
              {formatDealSize(dealSizeMin, dealSizeMax)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Geography</p>
            <p className="text-sm font-medium text-foreground truncate">
              {geography.split(',')[0]}
            </p>
          </div>
        </div>
      </div>

      {/* Match count + last updated */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-mode-strategy">{strategy.matchCount}</span>
          <span className="ml-1.5 text-xs text-muted-foreground">matches</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{formatRelativeTime(strategy.updatedAt)}</span>
        </div>
      </div>

      {/* Active deal rooms */}
      {strategy.activeDealRoomCount > 0 && (
        <button
          onClick={onViewDealRooms}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-mode-strategy hover:underline transition-colors"
        >
          <DoorOpen size={12} />
          <span>{strategy.activeDealRoomCount} active deal room{strategy.activeDealRoomCount !== 1 ? 's' : ''}</span>
          <span className="text-muted-foreground">— View Deal Rooms</span>
        </button>
      )}

      {/* Actions */}
      <div className="mt-5 flex gap-2">
        <button
          onClick={onEdit}
          className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        >
          Edit
        </button>
        {strategy.status === 'broadcasting' && (
          <button
            onClick={onPause}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            Pause
          </button>
        )}
        {strategy.status === 'paused' && (
          <button
            onClick={onResume}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            Resume
          </button>
        )}
      </div>
    </div>
  )
}
