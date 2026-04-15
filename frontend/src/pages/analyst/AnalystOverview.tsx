import { useMemo } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { MOCK_ANALYST_MEMOS, type AiFlagColor } from '@/data/mock/analystMemos'
import { MOCK_DS_TASKS } from '@/data/mock/dsTasks'
import { MOCK_ADMIN_EXCEPTIONS } from '@/data/mock/adminExceptions'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import InternalOverview from '@/components/internal/InternalOverview'

const FLAG_ORDER: Record<AiFlagColor, number> = {
  red: 0,
  yellow: 1,
  green: 2,
}

const FLAG_BADGE: Record<AiFlagColor, { label: string; className: string }> = {
  red: {
    label: 'Red',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
  yellow: {
    label: 'Yellow',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  green: {
    label: 'Green',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
}

interface AnalystOverviewProps {
  onNavigateToTasks: () => void
  onNavigateToReview: (memoId: string) => void
}

export default function AnalystOverview({
  onNavigateToTasks,
  onNavigateToReview,
}: AnalystOverviewProps) {
  const topMemos = useMemo(() => {
    return [...MOCK_ANALYST_MEMOS]
      .sort((a, b) => {
        const diff = FLAG_ORDER[a.flagColor] - FLAG_ORDER[b.flagColor]
        if (diff !== 0) return diff
        return new Date(a.memoDate).getTime() - new Date(b.memoDate).getTime()
      })
      .slice(0, 3)
  }, [])

  // Shared team totals
  const totalDeals = MOCK_SELLER_DEAL_ROOMS.filter((d) => d.status !== 'draft').length
  const totalTeamTasks =
    MOCK_DS_TASKS.length + MOCK_ANALYST_MEMOS.length + MOCK_ADMIN_EXCEPTIONS.length

  // Analyst role-specific: red-flagged memos requiring urgent review
  const redFlagCount = MOCK_ANALYST_MEMOS.filter((m) => m.flagColor === 'red').length

  return (
    <InternalOverview
      title="Analyst Overview"
      subtitle="AI memo review queue and pipeline status at a glance."
      breadcrumbs={[{ label: 'Overview' }]}
      stats={[
        { value: totalDeals, label: 'Total Deals' },
        { value: totalTeamTasks, label: 'Total Tasks' },
        { value: redFlagCount, label: 'Red Flag Memos' },
      ]}
      taskSummary={{
        label: 'Review Queue',
        icon: ClipboardCheck,
        iconClassName: 'text-blue-400',
        pendingBadgeClassName:
          'border-blue-500/30 bg-blue-500/10 text-blue-400',
        pendingCount: MOCK_ANALYST_MEMOS.length,
        topItems: topMemos.map((memo) => ({
          id: memo.id,
          title: memo.dealName,
          subtitle: `${memo.assetSubType} · ${memo.sellerName}`,
          badge: {
            label: FLAG_BADGE[memo.flagColor].label,
            className: FLAG_BADGE[memo.flagColor].className,
          },
          onClick: () => onNavigateToReview(memo.id),
        })),
        onViewAll: onNavigateToTasks,
        emptyMessage: 'No memos pending review.',
      }}
    />
  )
}
