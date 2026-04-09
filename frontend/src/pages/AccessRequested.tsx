import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import BuyerEmptyState from '@/components/BuyerEmptyState'
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item'

// ── Local mock data ─────────────────────────────────────────────────────────

type AccessStatus = 'access_pending' | 'wait_queue' | 'invited'

interface AccessRequestRow {
  dealId: string
  status: AccessStatus
  requestDate: string
}

const MOCK_ACCESS_REQUESTS: AccessRequestRow[] = [
  { dealId: 'dr_001', status: 'access_pending', requestDate: '2026-03-28' },
  { dealId: 'dr_005', status: 'wait_queue', requestDate: '2026-03-15' },
  { dealId: 'dr_006', status: 'invited', requestDate: '2026-03-22' },
]

const STATUS_BADGE_CONFIG: Record<AccessStatus, { label: string; classes: string }> = {
  access_pending: { label: 'Under Review', classes: 'bg-amber-500/20 text-amber-400' },
  wait_queue: { label: 'Wait Queue', classes: 'bg-gray-500/20 text-gray-400' },
  invited: { label: 'Invited', classes: 'bg-mode-buy/20 text-mode-buy' },
}

const ASSET_SUBTYPE_LABELS: Record<string, string> = {
  build_for_rent: 'BFR',
  sfr_portfolio: 'SFR Portfolio',
  multifamily: 'Multifamily',
  land: 'Land',
}

// ── Component ───────────────────────────────────────────────────────────────

interface AccessRequestedProps {
  onOpenDealRoom: (dealId: string) => void
}

export default function AccessRequested({ onOpenDealRoom }: AccessRequestedProps) {
  const rows = MOCK_ACCESS_REQUESTS.map((req) => {
    const deal = MOCK_SELLER_DEAL_ROOMS.find((d) => d.id === req.dealId)
    if (!deal) return null
    return { ...req, deal }
  }).filter(Boolean) as (AccessRequestRow & { deal: (typeof MOCK_SELLER_DEAL_ROOMS)[number] })[]

  if (rows.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-5">
        <h1 className="text-xl font-semibold text-foreground mb-5">Access Requested</h1>
        <BuyerEmptyState variant="no-access-requests" />
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-5 space-y-5 max-w-[1600px] mx-auto min-w-0">
      {/* Page heading */}
      <h1 className="text-xl font-semibold text-foreground">Access Requested</h1>

      {/* Request list */}
      <div className="flex flex-col gap-2">
        {rows.map((row) => {
          const badge = STATUS_BADGE_CONFIG[row.status]
          return (
            <Item
              key={row.dealId}
              variant="outline"
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => {
                if (row.status === 'invited') onOpenDealRoom(row.dealId)
              }}
            >
              <ItemContent>
                <ItemTitle className="text-sm font-semibold text-foreground">
                  {row.deal.name}
                </ItemTitle>
                <ItemDescription className="text-xs text-muted-foreground">
                  {ASSET_SUBTYPE_LABELS[row.deal.assetSubType] ?? row.deal.assetSubType}
                  {' · '}
                  Requested {new Date(row.requestDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badge.classes}`}>
                  {badge.label}
                </span>
              </ItemActions>
            </Item>
          )
        })}
      </div>
    </div>
  )
}
