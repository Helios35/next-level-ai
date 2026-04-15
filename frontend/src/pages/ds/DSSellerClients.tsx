import { useMemo } from 'react'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { DataTable } from '@/components/ui/data-table'
import { DataTableFooter } from '@/components/ui/data-table-footer'
import type { Column } from '@/components/ui/data-table.types'
import { usePagination } from '@/hooks/usePagination'

// Seller contact lookup — matches DSDealView and DSPipeline
export const SELLER_CONTACTS: Record<string, { name: string; email: string; phone: string }> = {
  user_001: { name: 'Marcus Webb', email: 'marcus.webb@trianglecap.com', phone: '(704) 555-0192' },
  user_009: { name: 'Jordan Fields', email: 'jordan@sunbeltdev.com', phone: '(615) 555-0314' },
  user_010: { name: 'Carol Tran', email: 'carol.tran@landmarkdev.com', phone: '(512) 555-0291' },
  user_011: { name: 'Brian Okafor', email: 'b.okafor@pinecresthomes.com', phone: '(480) 555-0178' },
  user_012: { name: 'Lisa Cheng', email: 'lisa.cheng@primevest.com', phone: '(919) 555-0133' },
  user_013: { name: 'Darren Brooks', email: 'darren@brooksgroupre.com', phone: '(214) 555-0245' },
  user_014: { name: 'Anika Patel', email: 'anika.patel@horizondev.com', phone: '(303) 555-0187' },
  user_015: { name: 'Tyler Moss', email: 'tyler@mossholdings.com', phone: '(404) 555-0272' },
  user_016: { name: 'Nina Reyes', email: 'nina.reyes@suncoastcap.com', phone: '(813) 555-0196' },
  user_017: { name: 'Kevin Strauss', email: 'kstrauss@straussdev.com', phone: '(512) 555-0318' },
  user_018: { name: 'Samira Hassan', email: 'samira@crescentgroup.com', phone: '(615) 555-0421' },
}

interface SellerRow {
  sellerId: string
  name: string
  activeDeals: number
  lastActivity: string
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

interface DSSellerClientsProps {
  /** Search term owned by the parent DSClients page header */
  search: string
  onNavigateToProfile: (sellerId: string) => void
}

export default function DSSellerClients({
  search,
  onNavigateToProfile,
}: DSSellerClientsProps) {
  const sellers = useMemo<SellerRow[]>(() => {
    const grouped = new Map<string, SellerRow>()

    for (const deal of MOCK_SELLER_DEAL_ROOMS) {
      const existing = grouped.get(deal.sellerId)
      const isActive = deal.status === 'active' || deal.status === 'market_tested'
      if (existing) {
        if (isActive) existing.activeDeals++
        if (deal.updatedAt > existing.lastActivity) existing.lastActivity = deal.updatedAt
      } else {
        grouped.set(deal.sellerId, {
          sellerId: deal.sellerId,
          name: SELLER_CONTACTS[deal.sellerId]?.name ?? deal.sellerId,
          activeDeals: isActive ? 1 : 0,
          lastActivity: deal.updatedAt,
        })
      }
    }

    return Array.from(grouped.values())
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return sellers
    return sellers.filter((s) => s.name.toLowerCase().includes(term))
  }, [sellers, search])

  const { pagedData, totalCount, pageSize, currentPage, setPage } = usePagination(
    filtered,
    { pageSize: 25, resetKey: search },
  )

  const columns: Column<SellerRow>[] = [
    {
      key: 'name',
      label: 'Seller Name',
      sortable: true,
      sortAccessor: (row) => row.name,
      render: (row) => (
        <span className="font-medium text-foreground">{row.name}</span>
      ),
    },
    {
      key: 'activeDeals',
      label: 'Active Deals',
      sortable: true,
      sortAccessor: (row) => row.activeDeals,
      align: 'right',
      render: (row) => row.activeDeals,
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      sortable: true,
      sortAccessor: (row) => new Date(row.lastActivity),
      render: (row) => formatRelativeTime(row.lastActivity),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={pagedData}
        rowKey={(row) => row.sellerId}
        defaultSort={{ key: 'lastActivity', direction: 'desc' }}
        onRowClick={(row) => onNavigateToProfile(row.sellerId)}
        emptyMessage="No sellers match your search."
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
