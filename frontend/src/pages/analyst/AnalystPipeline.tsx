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
  const now = new Date()
  const date = new Date(iso)
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AnalystPipeline() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return MOCK_SELLER_DEAL_ROOMS
    return MOCK_SELLER_DEAL_ROOMS.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        (SELLER_NAMES[d.sellerId] ?? '').toLowerCase().includes(term),
    )
  }, [search])

  const { pagedData, totalCount, pageSize, currentPage, setPage } = usePagination(
    filtered,
    { pageSize: 25, resetKey: search },
  )

  const columns: Column<DealRoom>[] = [
    {
      key: 'name',
      label: 'Deal Name',
      sortable: true,
      sortAccessor: (row) => row.name,
      render: (row) => (
        <span className="font-medium text-foreground">{row.name}</span>
      ),
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
      key: 'seller',
      label: 'Seller',
      sortable: true,
      sortAccessor: (row) => SELLER_NAMES[row.sellerId] ?? '',
      render: (row) => SELLER_NAMES[row.sellerId] ?? 'Unknown',
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      sortable: true,
      sortAccessor: (row) => new Date(row.updatedAt),
      render: (row) => formatDate(row.updatedAt),
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Breadcrumbs className="mb-4" items={[{ label: 'Pipeline' }]} />

      <DataTableHeader
        title="Pipeline"
        subtitle="Full pipeline visibility across all stages. Read-only."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search deal or seller..."
      />

      <DataTable
        columns={columns}
        data={pagedData}
        rowKey={(row) => row.id}
        defaultSort={{ key: 'currentStage', direction: 'desc' }}
        rowClassName={(row) => (row.status === 'dormant' ? 'opacity-50' : undefined)}
        emptyMessage="No deals match your search."
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
