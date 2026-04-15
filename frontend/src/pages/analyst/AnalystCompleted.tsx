import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { DataTable } from '@/components/ui/data-table'
import { DataTableHeader } from '@/components/ui/data-table-header'
import { DataTableFooter } from '@/components/ui/data-table-footer'
import type { Column } from '@/components/ui/data-table.types'
import { usePagination } from '@/hooks/usePagination'

type AnalystDecision = 'approve' | 'return' | 'reject'

interface CompletedReview {
  id: string
  dealName: string
  decision: AnalystDecision
  date: string
  notes?: string
}

const DECISION_CONFIG: Record<AnalystDecision, { label: string; className: string }> = {
  approve: {
    label: 'Approve',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  return: {
    label: 'Return',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  reject: {
    label: 'Reject',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
}

// Mock completed reviews — in production these would come from the API
const MOCK_COMPLETED: CompletedReview[] = [
  {
    id: 'cr_001',
    dealName: 'Riverside Estates — Atlanta',
    decision: 'approve',
    date: '2026-03-15T14:00:00Z',
  },
  {
    id: 'cr_002',
    dealName: 'Oakwood Portfolio — Dallas',
    decision: 'return',
    date: '2026-03-12T10:30:00Z',
    notes:
      'Cap rate analysis inconsistent with trailing NOI. Returned for pricing review with seller.',
  },
  {
    id: 'cr_003',
    dealName: 'Summit Land — Denver',
    decision: 'reject',
    date: '2026-03-08T09:00:00Z',
    notes: 'No buyer demand at asking price. Unentitled parcel priced at entitled comps.',
  },
  {
    id: 'cr_004',
    dealName: 'Pinecrest Multifamily — Phoenix',
    decision: 'approve',
    date: '2026-03-05T16:45:00Z',
  },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AnalystCompleted() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return MOCK_COMPLETED
    return MOCK_COMPLETED.filter(
      (r) =>
        r.dealName.toLowerCase().includes(term) ||
        (r.notes ?? '').toLowerCase().includes(term),
    )
  }, [search])

  const { pagedData, totalCount, pageSize, currentPage, setPage } = usePagination(
    filtered,
    { pageSize: 25, resetKey: search },
  )

  const columns: Column<CompletedReview>[] = [
    {
      key: 'dealName',
      label: 'Deal Name',
      sortable: true,
      sortAccessor: (row) => row.dealName,
      render: (row) => (
        <span className="font-medium text-foreground">{row.dealName}</span>
      ),
    },
    {
      key: 'decision',
      label: 'Decision',
      sortable: true,
      sortAccessor: (row) => row.decision,
      render: (row) => {
        const decision = DECISION_CONFIG[row.decision]
        return (
          <Badge variant="outline" className={decision.className}>
            {decision.label}
          </Badge>
        )
      },
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      sortAccessor: (row) => new Date(row.date),
      render: (row) => formatDate(row.date),
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (row) =>
        row.notes ?? <span className="text-muted-foreground/50">—</span>,
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Breadcrumbs className="mb-4" items={[{ label: 'Completed' }]} />

      <DataTableHeader
        title="Completed Reviews"
        subtitle="Archive of all past analyst decisions."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search deal or notes..."
      />

      <DataTable
        columns={columns}
        data={pagedData}
        rowKey={(row) => row.id}
        defaultSort={{ key: 'date', direction: 'desc' }}
        emptyMessage="No completed reviews match your search."
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
