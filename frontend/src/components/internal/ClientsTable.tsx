import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/breadcrumbs'
import { DataTable } from '@/components/ui/data-table'
import { DataTableHeader } from '@/components/ui/data-table-header'
import { DataTableFooter } from '@/components/ui/data-table-footer'
import type { Column } from '@/components/ui/data-table.types'
import { usePagination } from '@/hooks/usePagination'
import { MOCK_CLIENTS, type ClientRecord } from '@/data/mock/clients'

type ClientFilter = 'all' | 'buyers' | 'sellers'

const CLIENT_TABS = [
  { value: 'all', label: 'All' },
  { value: 'buyers', label: 'Buyers' },
  { value: 'sellers', label: 'Sellers' },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface ClientsTableProps {
  title?: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  /** When true, rows are not clickable and the header shows a read-only hint */
  readOnly?: boolean
  /** Called when a client row is clicked. If omitted, rows are not clickable. */
  onNavigateToClient?: (clientId: string) => void
  /** Override the data source — defaults to MOCK_CLIENTS */
  clients?: ClientRecord[]
}

export default function ClientsTable({
  title = 'Clients',
  subtitle = 'All buyer and seller accounts on the platform.',
  breadcrumbs,
  readOnly = false,
  onNavigateToClient,
  clients = MOCK_CLIENTS,
}: ClientsTableProps) {
  const [filter, setFilter] = useState<ClientFilter>('all')
  const [search, setSearch] = useState('')

  // ── Filter + search ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return clients.filter((c) => {
      if (filter === 'buyers' && c.type !== 'buyer') return false
      if (filter === 'sellers' && c.type !== 'seller') return false
      if (!term) return true
      return (
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
      )
    })
  }, [clients, filter, search])

  // ── Pagination ──────────────────────────────────────────────────────────
  const { pagedData, totalCount, pageSize, currentPage, setPage } = usePagination(
    filtered,
    { pageSize: 25, resetKey: `${filter}|${search}` },
  )

  // ── Columns ─────────────────────────────────────────────────────────────
  const showQualification = filter !== 'sellers'

  const columns: Column<ClientRecord>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      sortAccessor: (row) => row.name,
      render: (row) => (
        <span className="font-medium text-foreground">{row.name}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      sortAccessor: (row) => row.email,
      hideBelow: 'sm',
      render: (row) => row.email,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      sortAccessor: (row) => row.type,
      render: (row) => (
        <Badge
          variant="outline"
          className={
            row.type === 'buyer'
              ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          }
        >
          {row.type === 'buyer' ? 'Buyer' : 'Seller'}
        </Badge>
      ),
    },
    ...(showQualification
      ? [
          {
            key: 'qualification',
            label: 'Qualification',
            sortable: true,
            sortAccessor: (row: ClientRecord) => row.qualificationStatus ?? 'z',
            render: (row: ClientRecord) =>
              row.type === 'buyer' ? (
                <Badge
                  variant="outline"
                  className={
                    row.qualificationStatus === 'qualified'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                  }
                >
                  {row.qualificationStatus === 'qualified' ? 'Qualified' : 'Unqualified'}
                </Badge>
              ) : (
                <span className="text-muted-foreground/50">—</span>
              ),
          } as Column<ClientRecord>,
        ]
      : []),
    {
      key: 'activeDeals',
      label: 'Active Deals',
      sortable: true,
      sortAccessor: (row) => row.activeDeals,
      align: 'right',
      render: (row) => row.activeDeals,
    },
    {
      key: 'joined',
      label: 'Joined',
      sortable: true,
      sortAccessor: (row) => new Date(row.joinedDate),
      hideBelow: 'md',
      render: (row) => formatDate(row.joinedDate),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      sortAccessor: (row) => row.accountStatus,
      render: (row) => (
        <Badge
          variant="outline"
          className={
            row.accountStatus === 'active'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
          }
        >
          {row.accountStatus === 'active' ? 'Active' : 'Suspended'}
        </Badge>
      ),
    },
  ]

  const rowClickable = !readOnly && !!onNavigateToClient

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs className="mb-4" items={breadcrumbs} />
      )}

      <DataTableHeader
        title={title}
        subtitle={
          readOnly ? `${subtitle} (read-only)` : subtitle
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        tabs={CLIENT_TABS}
        activeTab={filter}
        onTabChange={(v) => setFilter(v as ClientFilter)}
      />

      <DataTable
        columns={columns}
        data={pagedData}
        rowKey={(row) => row.id}
        defaultSort={{ key: 'name', direction: 'asc' }}
        onRowClick={rowClickable ? (row) => onNavigateToClient?.(row.id) : undefined}
        emptyMessage="No clients match your filters."
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
