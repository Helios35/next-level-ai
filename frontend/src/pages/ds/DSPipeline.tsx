import { useMemo, useState } from 'react'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { DataTable } from '@/components/ui/data-table'
import { DataTableHeader } from '@/components/ui/data-table-header'
import { DataTableFooter } from '@/components/ui/data-table-footer'
import type { Column } from '@/components/ui/data-table.types'
import { usePagination } from '@/hooks/usePagination'
import type { DealRoom } from '@shared/types/dealRoom'
import type { DealRoomStatus } from '@shared/types/enums'

// ── Constants ────────────────────────────────────────────────────────────

type PipelineFilter = 'all' | 'active' | 'market_tested' | 'dormant'

const PIPELINE_TABS = [
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
  const now = new Date('2026-04-14T12:00:00Z')
  const then = new Date(iso)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 30) return `${diffDays} days ago`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths} mo ago`
}

function applyTabFilter(deals: DealRoom[], filter: PipelineFilter): DealRoom[] {
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

// ── Component ────────────────────────────────────────────────────────────

interface DSPipelineProps {
  onNavigateToDeal?: (dealId: string) => void
}

export default function DSPipeline({ onNavigateToDeal }: DSPipelineProps) {
  const [filter, setFilter] = useState<PipelineFilter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const base = applyTabFilter(MOCK_SELLER_DEAL_ROOMS, filter)
    const term = search.trim().toLowerCase()
    if (!term) return base
    return base.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        (SELLER_NAMES[d.sellerId] ?? '').toLowerCase().includes(term),
    )
  }, [filter, search])

  const { pagedData, totalCount, pageSize, currentPage, setPage } = usePagination(
    filtered,
    { pageSize: 25, resetKey: `${filter}|${search}` },
  )

  const columns: Column<DealRoom>[] = [
    {
      key: 'name',
      label: 'Deal Name',
      sortable: true,
      sortAccessor: (row) => row.name,
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigateToDeal?.(row.id)
          }}
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          {row.name}
        </button>
      ),
    },
    {
      key: 'assetSubType',
      label: 'Asset Type',
      sortable: true,
      sortAccessor: (row) => SUBTYPE_LABELS[row.assetSubType] ?? row.assetSubType,
      hideBelow: 'md',
      render: (row) => SUBTYPE_LABELS[row.assetSubType] ?? row.assetSubType,
    },
    {
      key: 'seller',
      label: 'Seller',
      sortable: true,
      sortAccessor: (row) => SELLER_NAMES[row.sellerId] ?? '',
      hideBelow: 'lg',
      render: (row) => SELLER_NAMES[row.sellerId] ?? 'Unknown',
    },
    {
      key: 'currentStage',
      label: 'Stage',
      sortable: true,
      sortAccessor: (row) => row.currentStage,
      render: (row) => (
        <>
          <span className="font-medium text-foreground">{row.currentStage}</span>
          <span className="ml-1 text-xs">{STAGE_LABELS[row.currentStage] ?? ''}</span>
        </>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      sortAccessor: (row) => STATUS_LABELS[row.status],
      render: (row) => (
        <Badge className={STATUS_BADGE_CLASS[row.status]}>
          {STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      key: 'seats',
      label: 'Seats',
      hideBelow: 'lg',
      sortable: true,
      sortAccessor: (row) =>
        row.currentStage >= 6 ? Math.min(row.matchedBuyerCount, 3) : -1,
      render: (row) =>
        row.currentStage >= 6 ? `${Math.min(row.matchedBuyerCount, 3)} / 3` : '—',
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      hideBelow: 'sm',
      sortable: true,
      sortAccessor: (row) => new Date(row.updatedAt),
      render: (row) => formatRelativeTime(row.updatedAt),
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Breadcrumbs className="mb-4" items={[{ label: 'Pipeline' }]} />

      <DataTableHeader
        title="Pipeline"
        subtitle={`${totalCount} deal${totalCount !== 1 ? 's' : ''}`}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search deal or seller..."
        tabs={PIPELINE_TABS}
        activeTab={filter}
        onTabChange={(v) => setFilter(v as PipelineFilter)}
      />

      <DataTable
        columns={columns}
        data={pagedData}
        rowKey={(row) => row.id}
        defaultSort={{ key: 'currentStage', direction: 'desc' }}
        onRowClick={(row) => onNavigateToDeal?.(row.id)}
        rowClassName={(row) => (row.status === 'dormant' ? 'opacity-50' : undefined)}
        emptyMessage="No deals match this filter."
      />

      <DataTableFooter
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setPage}
      />
    </div>
  )
}
