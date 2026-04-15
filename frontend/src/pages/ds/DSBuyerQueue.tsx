import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { DataTableFooter } from '@/components/ui/data-table-footer'
import type { Column } from '@/components/ui/data-table.types'
import { usePagination } from '@/hooks/usePagination'
import { MOCK_BUYER_POOL_DR001, MOCK_BUYER_POOL_DR002, MOCK_BUYER_POOL_DR005 } from '@/data/mock/buyerPool'
import { DS_BUYER_NAMES, DS_BUYER_FIRM_TYPES } from '@/data/mock/dsConversations'
import type { BuyerPoolEntry } from '@shared/types/buyerPool'

const ALL_BUYER_POOL: BuyerPoolEntry[] = [
  ...MOCK_BUYER_POOL_DR001,
  ...MOCK_BUYER_POOL_DR002,
  ...MOCK_BUYER_POOL_DR005,
]

const QUAL_BADGE: Record<string, string> = {
  qualified: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  not_qualified: 'border-red-500/30 bg-red-500/10 text-red-400',
}

const SEAT_BADGE: Record<string, string> = {
  seated: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  invited: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  accepted: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  passed: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
}

const SEAT_LABELS: Record<string, string> = {
  seated: 'Seated',
  pending: 'Pending',
  invited: 'Invited',
  accepted: 'Accepted',
  passed: 'Passed',
}

function formatRelativeTime(iso: string): string {
  const now = new Date('2026-04-14T12:00:00Z')
  const then = new Date(iso)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

interface BuyerRow {
  buyerId: string
  name: string
  firmType: string
  qualificationStatus: string
  activeDeals: number
  mostRecentSeatStatus: string
  lastActivity: string
}

interface DSBuyerQueueProps {
  /** Search term owned by the parent DSClients page header */
  search: string
  onNavigateToProfile: (buyerId: string) => void
}

export default function DSBuyerQueue({
  search,
  onNavigateToProfile,
}: DSBuyerQueueProps) {
  const buyers = useMemo<BuyerRow[]>(() => {
    const grouped = new Map<string, BuyerRow>()

    for (const entry of ALL_BUYER_POOL) {
      const existing = grouped.get(entry.buyerId)
      const timestamp = entry.seatedAt ?? entry.accessRequestedAt ?? entry.passedAt ?? ''
      const isActive =
        entry.seatStatus === 'seated' ||
        entry.seatStatus === 'pending' ||
        entry.seatStatus === 'invited' ||
        entry.seatStatus === 'accepted'

      if (existing) {
        if (isActive) existing.activeDeals++
        if (timestamp > existing.lastActivity) {
          existing.lastActivity = timestamp
          existing.mostRecentSeatStatus = entry.seatStatus
        }
      } else {
        grouped.set(entry.buyerId, {
          buyerId: entry.buyerId,
          name: DS_BUYER_NAMES[entry.buyerId] ?? entry.anonymizedLabel,
          firmType: DS_BUYER_FIRM_TYPES[entry.buyerId] ?? '—',
          qualificationStatus: entry.qualificationStatus,
          activeDeals: isActive ? 1 : 0,
          mostRecentSeatStatus: entry.seatStatus,
          lastActivity: timestamp,
        })
      }
    }

    return Array.from(grouped.values())
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return buyers
    return buyers.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.firmType.toLowerCase().includes(term),
    )
  }, [buyers, search])

  const { pagedData, totalCount, pageSize, currentPage, setPage } = usePagination(
    filtered,
    { pageSize: 25, resetKey: search },
  )

  const columns: Column<BuyerRow>[] = [
    {
      key: 'name',
      label: 'Buyer Name',
      sortable: true,
      sortAccessor: (row) => row.name,
      render: (row) => (
        <span className="font-medium text-foreground">{row.name}</span>
      ),
    },
    {
      key: 'firmType',
      label: 'Firm Type',
      sortable: true,
      sortAccessor: (row) => row.firmType,
      hideBelow: 'sm',
      render: (row) => row.firmType,
    },
    {
      key: 'qualificationStatus',
      label: 'Qualification',
      render: (row) => (
        <Badge className={QUAL_BADGE[row.qualificationStatus] ?? ''}>
          {row.qualificationStatus === 'qualified' ? 'Qualified' : 'Not Qualified'}
        </Badge>
      ),
    },
    {
      key: 'activeDeals',
      label: 'Active Deals',
      sortable: true,
      sortAccessor: (row) => row.activeDeals,
      align: 'right',
      hideBelow: 'md',
      render: (row) => row.activeDeals,
    },
    {
      key: 'seatStatus',
      label: 'Seat Status',
      render: (row) => (
        <Badge className={SEAT_BADGE[row.mostRecentSeatStatus] ?? ''}>
          {SEAT_LABELS[row.mostRecentSeatStatus] ?? row.mostRecentSeatStatus}
        </Badge>
      ),
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      sortable: true,
      sortAccessor: (row) => (row.lastActivity ? new Date(row.lastActivity) : new Date(0)),
      hideBelow: 'lg',
      render: (row) => (row.lastActivity ? formatRelativeTime(row.lastActivity) : '—'),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={pagedData}
        rowKey={(row) => row.buyerId}
        defaultSort={{ key: 'lastActivity', direction: 'desc' }}
        onRowClick={(row) => onNavigateToProfile(row.buyerId)}
        emptyMessage="No buyers match your search."
      />
      <DataTableFooter
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setPage}
      />
    </>
  )
}
