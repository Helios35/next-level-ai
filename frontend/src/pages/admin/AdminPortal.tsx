import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { MOCK_ADMIN_EXCEPTIONS } from '@/data/mock/adminExceptions'
import { MOCK_DS_TASKS } from '@/data/mock/dsTasks'
import { MOCK_ANALYST_MEMOS } from '@/data/mock/analystMemos'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { MOCK_INTERNAL_USERS } from '@/data/mock/internalUsers'
import InternalOverview from '@/components/internal/InternalOverview'

interface AdminPortalProps {
  onNavigateToTasks: () => void
  onNavigateToDeal: (dealId: string) => void
}

export default function AdminPortal({
  onNavigateToTasks,
  onNavigateToDeal,
}: AdminPortalProps) {
  const topExceptions = useMemo(
    () =>
      [...MOCK_ADMIN_EXCEPTIONS]
        .sort((a, b) => b.daysPending - a.daysPending)
        .slice(0, 3),
    [],
  )

  // Shared team totals
  const totalDeals = MOCK_SELLER_DEAL_ROOMS.filter((d) => d.status !== 'draft').length
  const totalTeamTasks =
    MOCK_DS_TASKS.length + MOCK_ANALYST_MEMOS.length + MOCK_ADMIN_EXCEPTIONS.length

  // Admin role-specific: active staff members under management
  const activeStaff = MOCK_INTERNAL_USERS.filter((u) => u.status === 'active').length

  return (
    <InternalOverview
      title="Admin Overview"
      subtitle="Exception queue and team status at a glance."
      breadcrumbs={[{ label: 'Overview' }]}
      stats={[
        { value: totalDeals, label: 'Total Deals' },
        { value: totalTeamTasks, label: 'Total Tasks' },
        { value: activeStaff, label: 'Active Staff' },
      ]}
      taskSummary={{
        label: 'Exception Queue',
        icon: AlertTriangle,
        iconClassName: 'text-amber-400',
        pendingCount: MOCK_ADMIN_EXCEPTIONS.length,
        topItems: topExceptions.map((exc) => ({
          id: exc.id,
          title: exc.dealName,
          subtitle: exc.flagReasons[0],
          badge: {
            label: `${exc.daysPending}d pending`,
            className: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
          },
          onClick: () => onNavigateToDeal(exc.dealId),
        })),
        onViewAll: onNavigateToTasks,
        emptyMessage: 'No exceptions pending.',
      }}
    />
  )
}
