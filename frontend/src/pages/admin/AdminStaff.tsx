import { useMemo, useState } from 'react'
import { MOCK_INTERNAL_USERS } from '@/data/mock/internalUsers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { DataTable } from '@/components/ui/data-table'
import { DataTableHeader } from '@/components/ui/data-table-header'
import { DataTableFooter } from '@/components/ui/data-table-footer'
import type { Column } from '@/components/ui/data-table.types'
import { usePagination } from '@/hooks/usePagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import type { InternalUser } from '@shared/types/internalUser'
import type { InternalRole } from '@shared/types/enums'

const ROLE_LABELS: Record<InternalRole, string> = {
  ds: 'Disposition Specialist',
  analyst: 'Analyst',
  admin: 'Admin',
}

const ROLE_TABS = [
  { value: 'all', label: 'All' },
  { value: 'ds', label: 'DS' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'admin', label: 'Admin' },
]

type RoleFilter = 'all' | InternalRole

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

interface AdminStaffProps {
  onNavigateToCreate: () => void
}

export default function AdminStaff({ onNavigateToCreate }: AdminStaffProps) {
  const [staff, setStaff] = useState<InternalUser[]>(MOCK_INTERNAL_USERS)
  const [deactivateTarget, setDeactivateTarget] = useState<InternalUser | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const handleDeactivate = () => {
    if (!deactivateTarget) return
    setStaff((prev) =>
      prev.map((s) =>
        s.id === deactivateTarget.id
          ? { ...s, status: s.status === 'active' ? ('inactive' as const) : ('active' as const) }
          : s,
      ),
    )
    setDeactivateTarget(null)
  }

  // ── Filter + search ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return staff.filter((s) => {
      if (roleFilter !== 'all' && s.role !== roleFilter) return false
      if (!term) return true
      return (
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
      )
    })
  }, [staff, roleFilter, search])

  // ── Pagination ──────────────────────────────────────────────────────────
  const { pagedData, totalCount, pageSize, currentPage, setPage } =
    usePagination(filtered, { pageSize: 10, resetKey: `${roleFilter}|${search}` })

  // ── Columns ─────────────────────────────────────────────────────────────
  const columns: Column<InternalUser>[] = [
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
      key: 'role',
      label: 'Role',
      sortable: true,
      sortAccessor: (row) => ROLE_LABELS[row.role],
      render: (row) => ROLE_LABELS[row.role],
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      sortAccessor: (row) => row.email,
      render: (row) => row.email,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      sortAccessor: (row) => row.status,
      render: (row) => (
        <Badge
          variant="outline"
          className={
            row.status === 'active'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
          }
        >
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      sortAccessor: (row) => new Date(row.lastLogin),
      render: (row) => formatDate(row.lastLogin),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          className={
            row.status === 'active'
              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
              : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
          }
          onClick={(e) => {
            e.stopPropagation()
            setDeactivateTarget(row)
          }}
        >
          {row.status === 'active' ? 'Deactivate' : 'Reactivate'}
        </Button>
      ),
    },
  ]

  return (
    <>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Breadcrumbs className="mb-4" items={[{ label: 'Staff' }]} />

        <DataTableHeader
          title="Staff"
          subtitle="Internal team management and account provisioning."
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name or email..."
          tabs={ROLE_TABS}
          activeTab={roleFilter}
          onTabChange={(v) => setRoleFilter(v as RoleFilter)}
          actions={
            <Button onClick={onNavigateToCreate}>
              <Plus size={16} className="mr-2" />
              Add Staff Member
            </Button>
          }
        />

        <DataTable
          columns={columns}
          data={pagedData}
          rowKey={(row) => row.id}
          defaultSort={{ key: 'lastLogin', direction: 'desc' }}
          emptyMessage="No staff members match your filters."
        />

        <DataTableFooter
          totalCount={totalCount}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setPage}
        />
      </div>

      {/* Deactivate Confirmation Modal */}
      <Dialog open={deactivateTarget !== null} onOpenChange={() => setDeactivateTarget(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {deactivateTarget?.status === 'active'
                ? `Deactivate ${deactivateTarget?.name}?`
                : `Reactivate ${deactivateTarget?.name}?`}
            </DialogTitle>
            <DialogDescription>
              {deactivateTarget?.status === 'active'
                ? 'This will set their account to Inactive. They will not be able to log in. The account will not be deleted.'
                : 'This will restore their access to the platform.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className={
                deactivateTarget?.status === 'active'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }
              onClick={handleDeactivate}
            >
              {deactivateTarget?.status === 'active' ? 'Deactivate' : 'Reactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
