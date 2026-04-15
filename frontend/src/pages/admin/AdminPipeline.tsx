import { useMemo, useState } from 'react'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { DataTable } from '@/components/ui/data-table'
import { DataTableHeader } from '@/components/ui/data-table-header'
import { DataTableFooter } from '@/components/ui/data-table-footer'
import type { Column } from '@/components/ui/data-table.types'
import { usePagination } from '@/hooks/usePagination'
import FilterModal, {
  type FilterState,
  EMPTY_FILTERS,
} from '@/components/FilterModal'
import type { DealRoom } from '@shared/types/dealRoom'
import type { DealRoomStatus } from '@shared/types/enums'

// ── Label maps ───────────────────────────────────────────────────────────

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

const SELLER_NAMES: Record<string, string> = {
  user_001: 'Nathan Ivy',
  user_009: 'Jordan Fields',
  user_010: 'Carol Tran',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function relativeDate(iso: string): string {
  const now = new Date()
  const date = new Date(iso)
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

function countActiveFilters(filters: FilterState): number {
  return (
    filters.status.length +
    filters.stage.length +
    filters.assetType.length +
    filters.location.length +
    filters.dealStage.length +
    (filters.priceRange ? 1 : 0)
  )
}

// ── Component ────────────────────────────────────────────────────────────

interface AdminPipelineProps {
  onNavigateToDeal: (dealId: string) => void
}

export default function AdminPipeline({ onNavigateToDeal }: AdminPipelineProps) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return MOCK_SELLER_DEAL_ROOMS.filter((d) => {
      if (filters.status.length && !filters.status.includes(d.status)) return false
      if (
        filters.assetType.length &&
        !filters.assetType.includes(d.assetSubType)
      )
        return false
      if (!term) return true
      return (
        d.name.toLowerCase().includes(term) ||
        (SELLER_NAMES[d.sellerId] ?? '').toLowerCase().includes(term)
      )
    })
  }, [search, filters])

  const { pagedData, totalCount, pageSize, currentPage, setPage } = usePagination(
    filtered,
    { pageSize: 25, resetKey: `${search}|${JSON.stringify(filters)}` },
  )

  const columns: Column<DealRoom>[] = [
    {
      key: 'name',
      label: 'Deal Name',
      sortable: true,
      sortAccessor: (row) => row.name,
      render: (row) => {
        const isStage3 = row.currentStage === 3
        return (
          <span
            className={
              'font-medium text-foreground' +
              (isStage3 ? ' underline underline-offset-2' : '')
            }
          >
            {row.name}
          </span>
        )
      },
    },
    {
      key: 'seller',
      label: 'Seller',
      sortable: true,
      sortAccessor: (row) => SELLER_NAMES[row.sellerId] ?? '',
      render: (row) => SELLER_NAMES[row.sellerId] ?? 'Unknown',
    },
    {
      key: 'currentStage',
      label: 'Stage',
      sortable: true,
      sortAccessor: (row) => row.currentStage,
      render: (row) =>
        `Stage ${row.currentStage} — ${STAGE_LABELS[row.currentStage] ?? ''}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      sortAccessor: (row) => STATUS_LABELS[row.status],
      render: (row) => (
        <Badge variant="outline" className={STATUS_BADGE_CLASS[row.status]}>
          {STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      key: 'submitted',
      label: 'Submitted',
      sortable: true,
      sortAccessor: (row) => new Date(row.createdAt),
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      sortable: true,
      sortAccessor: (row) => new Date(row.updatedAt),
      render: (row) => relativeDate(row.updatedAt),
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Breadcrumbs className="mb-4" items={[{ label: 'Pipeline' }]} />

      <DataTableHeader
        title="Pipeline"
        subtitle="All deals across all stages and statuses."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search deal or seller..."
        filterCount={countActiveFilters(filters)}
        onOpenFilters={() => setFilterOpen(true)}
      />

      <DataTable
        columns={columns}
        data={pagedData}
        rowKey={(row) => row.id}
        defaultSort={{ key: 'currentStage', direction: 'desc' }}
        onRowClick={(row) => row.currentStage === 3 && onNavigateToDeal(row.id)}
        rowClassName={(row) => (row.status === 'dormant' ? 'opacity-50' : undefined)}
        emptyMessage="No deals match your filters."
      />

      <DataTableFooter
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setPage}
      />

      <FilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={(next) => {
          setFilters(next)
          setFilterOpen(false)
        }}
        onClear={() => {
          setFilters(EMPTY_FILTERS)
          setFilterOpen(false)
        }}
      />
    </div>
  )
}
