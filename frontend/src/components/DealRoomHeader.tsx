import { ArrowLeft } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { DealRoom } from '@shared/types/dealRoom'
import type { AssetSubType } from '@shared/types/enums'
import StatusBadge from '@/components/StatusBadge'
import DealMetricsBar from '@/components/DealMetricsBar'

const ASSET_SUBTYPE_LABELS: Record<AssetSubType, string> = {
  build_for_rent: 'Build-for-Rent',
  sfr_portfolio: 'SFR Portfolio',
  multifamily: 'Multifamily',
  land: 'Land',
}

function getUnitCount(deal: DealRoom): number | undefined {
  if (!deal.unique) return undefined
  return 'unitCount' in deal.unique ? deal.unique.unitCount : undefined
}

function buildDescription(deal: DealRoom): string {
  const parts: string[] = [ASSET_SUBTYPE_LABELS[deal.assetSubType]]
  const units = getUnitCount(deal)
  if (units) parts.push(`${units} units`)
  if (deal.address) parts.push(deal.address)
  return parts.join(' \u00B7 ')
}

interface DealRoomHeaderProps {
  deal: DealRoom
  onBack?: () => void
  className?: string
}

function DealRoomHeader({ deal, onBack, className }: DealRoomHeaderProps) {
  return (
    <div className={cn('shrink-0 border-b border-border bg-background px-6 pt-5 pb-4', className)}>
      {onBack && (
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Your Listings
        </button>
      )}

      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-foreground truncate">{deal.name}</h1>
            <StatusBadge status={deal.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {buildDescription(deal)}
          </p>
        </div>

        <DealMetricsBar
          currentStage={deal.currentStage}
          matchScore={deal.matchScore}
          matchedBuyerCount={deal.matchedBuyerCount}
          className="shrink-0"
        />
      </div>
    </div>
  )
}

export default DealRoomHeader
