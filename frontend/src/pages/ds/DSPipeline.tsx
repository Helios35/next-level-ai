import { useMemo, useState } from 'react'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import type { DealRoom } from '@shared/types/dealRoom'
import type { DealRoomStatus } from '@shared/types/enums'

// ── Helpers ───────────────────────────────────────────────────────────────

type PipelineFilter = 'all' | 'active' | 'market_tested' | 'dormant'

const FILTER_LABELS: { value: PipelineFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'market_tested', label: 'Market Tested' },
  { value: 'dormant', label: 'Dormant' },
]

const SUBTYPE_LABELS: Record<string, string> = {
  sfr_portfolio: 'SFR Portfolio',
  build_for_rent: 'Build-for-Rent',
  multifamily: 'Multifamily',
  land: 'Land',
}

const STAGE_LABELS: Record<number, string> = {
  1: 'Intake',
  2: 'Submission',
  3: 'QA Review',
  4: 'Financial Analysis',
  5: 'Decision Point',
  6: 'Coming Soon',
  7: 'Active Disposition',
  8: 'Offer Negotiation',
  9: 'Accepted Offer',
}

const STATUS_LABELS: Record<DealRoomStatus, string> = {
  active: 'Active',
  market_tested: 'Market Tested',
  dormant: 'Dormant',
  closed: 'Closed',
  withdrawn: 'Withdrawn',
  draft: 'Draft',
}

const STATUS_BADGE_CLASS: Record<DealRoomStatus, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  market_tested: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  dormant: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
  closed: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  withdrawn: 'border-red-500/30 bg-red-500/10 text-red-400',
  draft: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
}

// Mock seller name lookup — in production this would come from user data
const SELLER_NAMES: Record<string, string> = {
  user_001: 'Marcus Webb',
  user_009: 'Jordan Fields',
  user_010: 'Carol Tran',
  user_011: 'Brian Okafor',
  user_012: 'Lisa Cheng',
  user_013: 'Darren Brooks',
  user_014: 'Anika Patel',
  user_015: 'Tyler Moss',
  user_016: 'Nina Reyes',
  user_017: 'Kevin Strauss',
  user_018: 'Samira Hassan',
}

function formatRelativeTime(iso: string): string {
  const now = new Date('2026-04-14T12:00:00Z') // Mock "now" consistent with mock data
  const then = new Date(iso)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 30) return `${diffDays} days ago`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths} mo ago`
}

function filterDeals(deals: DealRoom[], filter: PipelineFilter): DealRoom[] {
  switch (filter) {
    case 'active':
      return deals.filter(
        (d) => d.status === 'active' && d.currentStage >= 6 && d.currentStage <= 9,
      )
    case 'market_tested':
      return deals.filter((d) => d.status === 'market_tested')
    case 'dormant':
      return deals.filter((d) => d.status === 'dormant')
    default:
      return deals
  }
}

// ── Component ─────────────────────────────────────────────────────────────

interface DSPipelineProps {
  onNavigateToDeal?: (dealId: string) => void
}

export default function DSPipeline({ onNavigateToDeal }: DSPipelineProps) {
  const [filter, setFilter] = useState<PipelineFilter>('all')

  const filteredDeals = useMemo(
    () => filterDeals(MOCK_SELLER_DEAL_ROOMS, filter),
    [filter],
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Breadcrumbs className="mb-4" items={[{ label: 'Pipeline' }]} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter tabs */}
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as PipelineFilter)}
        >
          <TabsList>
            {FILTER_LABELS.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-medium text-muted-foreground">Deal Name</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Asset Type</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground md:table-cell">Seller</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Stage</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground lg:table-cell">Seats</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground sm:table-cell">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeals.map((deal) => {
              const isDormant = deal.status === 'dormant'
              const rowClass = isDormant ? 'opacity-50' : ''

              return (
                <tr
                  key={deal.id}
                  className={`border-b border-border last:border-b-0 transition-colors hover:bg-muted/30 ${rowClass}`}
                >
                  {/* Deal Name — linked */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onNavigateToDeal?.(deal.id)}
                      className="font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      {deal.name}
                    </button>
                  </td>

                  {/* Asset Type / Subtype */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {SUBTYPE_LABELS[deal.assetSubType] ?? deal.assetSubType}
                  </td>

                  {/* Seller */}
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {SELLER_NAMES[deal.sellerId] ?? 'Unknown'}
                  </td>

                  {/* Stage */}
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="font-medium text-foreground">{deal.currentStage}</span>
                    <span className="ml-1 text-xs">
                      {STAGE_LABELS[deal.currentStage] ?? ''}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge className={STATUS_BADGE_CLASS[deal.status]}>
                      {STATUS_LABELS[deal.status]}
                    </Badge>
                  </td>

                  {/* Seats */}
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {deal.currentStage >= 6
                      ? `${Math.min(deal.matchedBuyerCount, 3)} / 3`
                      : '—'}
                  </td>

                  {/* Last Activity */}
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {formatRelativeTime(deal.updatedAt)}
                  </td>
                </tr>
              )
            })}

            {filteredDeals.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No deals match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
