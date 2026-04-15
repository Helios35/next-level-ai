import { useMemo } from 'react'
import { ClipboardList } from 'lucide-react'
import { MOCK_DS_TASKS } from '@/data/mock/dsTasks'
import { MOCK_ANALYST_MEMOS } from '@/data/mock/analystMemos'
import { MOCK_ADMIN_EXCEPTIONS } from '@/data/mock/adminExceptions'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import InternalOverview from '@/components/internal/InternalOverview'
import type { DsTaskUrgency } from '@shared/types/dsTask'

const URGENCY_ORDER: Record<DsTaskUrgency, number> = {
  action_required: 0,
  review_pending: 1,
  informational: 2,
}

const URGENCY_BADGE: Record<DsTaskUrgency, { label: string; className: string }> = {
  action_required: {
    label: 'Action Required',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
  review_pending: {
    label: 'Review Pending',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  informational: {
    label: 'Informational',
    className: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
  },
}

interface DSOverviewProps {
  onNavigateToTasks: () => void
  onNavigateToDeal: (dealId: string, tab: string) => void
}

export default function DSOverview({
  onNavigateToTasks,
  onNavigateToDeal,
}: DSOverviewProps) {
  const topTasks = useMemo(() => {
    return [...MOCK_DS_TASKS]
      .sort((a, b) => {
        const diff = URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]
        if (diff !== 0) return diff
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
      .slice(0, 3)
  }, [])

  // Shared team totals — same numbers across DS / Analyst / Admin
  const totalDeals = MOCK_SELLER_DEAL_ROOMS.filter((d) => d.status !== 'draft').length
  const totalTeamTasks =
    MOCK_DS_TASKS.length + MOCK_ANALYST_MEMOS.length + MOCK_ADMIN_EXCEPTIONS.length

  // DS role-specific: action-required tasks assigned to DS
  const myActionRequired = MOCK_DS_TASKS.filter(
    (t) => t.urgency === 'action_required',
  ).length

  return (
    <InternalOverview
      title="DS Overview"
      subtitle="Your task queue and pipeline status at a glance."
      breadcrumbs={[{ label: 'Overview' }]}
      stats={[
        { value: totalDeals, label: 'Total Deals' },
        { value: totalTeamTasks, label: 'Total Tasks' },
        { value: myActionRequired, label: 'My Action Required' },
      ]}
      taskSummary={{
        label: 'Task Queue',
        icon: ClipboardList,
        iconClassName: 'text-amber-400',
        pendingCount: MOCK_DS_TASKS.length,
        topItems: topTasks.map((task) => ({
          id: task.id,
          title: task.dealName,
          subtitle: task.geography,
          badge: {
            label: URGENCY_BADGE[task.urgency].label,
            className: URGENCY_BADGE[task.urgency].className,
          },
          onClick: () => onNavigateToDeal(task.dealId, task.targetTab),
        })),
        onViewAll: onNavigateToTasks,
        emptyMessage: 'No pending tasks. All caught up.',
      }}
    />
  )
}
