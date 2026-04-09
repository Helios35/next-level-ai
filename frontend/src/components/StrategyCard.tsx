import { cn } from '@/utils/cn'
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

// ── Component ──────────────────────────────────────────────────────────────

interface StrategyCardProps {
  strategy: BuyerStrategy
  onEdit?: () => void
  onPause?: () => void
  onResume?: () => void
  className?: string
}

export default function StrategyCard({
  strategy,
  onEdit,
  onPause,
  onResume,
  className,
}: StrategyCardProps) {
  const badge = STATUS_BADGE[strategy.status] ?? STATUS_BADGE.draft
  const subtypeLabel = SUBTYPE_LABELS[strategy.assetSubType] ?? strategy.assetSubType
  const assetTypeLabel = ASSET_TYPE_LABELS[strategy.assetType] ?? strategy.assetType
  const geography = (strategy.sharedCriteria?.geography as string) ?? '—'
  const dealSizeMin = strategy.sharedCriteria?.dealSizeMin as number | undefined
  const dealSizeMax = strategy.sharedCriteria?.dealSizeMax as number | undefined

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-border bg-muted/30 shadow-sm p-5 transition-colors hover:border-mode-strategy/30',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <h3 className="text-sm font-semibold text-foreground leading-snug truncate">
            {strategy.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{assetTypeLabel}</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0',
            badge.classes,
          )}
        >
          {badge.label}
        </span>
      </div>

      {/* Metadata row */}
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
        <span className="flex-1 text-center truncate">{subtypeLabel}</span>
        <div className="h-8 w-px bg-border shrink-0" />
        <span className="flex-1 text-center truncate">{geography.split(',')[0]}</span>
        <div className="h-8 w-px bg-border shrink-0" />
        <span className="flex-1 text-center truncate">{formatDealSize(dealSizeMin, dealSizeMax)}</span>
      </div>

      {/* Match count */}
      <div className="mt-4">
        <span className="text-2xl font-bold text-mode-strategy">{strategy.matchCount}</span>
        <span className="ml-1.5 text-xs text-muted-foreground">matches</span>
      </div>

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
