import { useMemo } from 'react'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { MOCK_ANALYST_MEMOS, type AnalystMemo, type AiFlagColor } from '@/data/mock/analystMemos'
import InternalTasks, {
  type TaskGroup,
  type TaskItem,
} from '@/components/internal/InternalTasks'

// ── Label maps ────────────────────────────────────────────────────────────

const FLAG_SECTION: Record<
  AiFlagColor,
  {
    label: string
    icon: typeof AlertCircle
    iconClassName: string
    badgeClassName: string
  }
> = {
  red: {
    label: 'Red Flag',
    icon: AlertCircle,
    iconClassName: 'text-red-400',
    badgeClassName: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
  yellow: {
    label: 'Yellow Flag',
    icon: Clock,
    iconClassName: 'text-amber-400',
    badgeClassName: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  green: {
    label: 'Green Flag',
    icon: CheckCircle2,
    iconClassName: 'text-emerald-400',
    badgeClassName: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
}

const FLAG_ORDER: AiFlagColor[] = ['red', 'yellow', 'green']

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function memoToItem(
  memo: AnalystMemo,
  flag: AiFlagColor,
  onReview: (memoId: string) => void,
): TaskItem {
  const section = FLAG_SECTION[flag]
  return {
    id: memo.id,
    title: memo.dealName,
    subtitle: `${memo.assetSubType} · ${memo.sellerName}`,
    typeLabel: 'AI Financial Memo',
    badge: {
      label: section.label,
      className: section.badgeClassName,
    },
    footer: `Memo generated ${formatDate(memo.memoDate)}`,
    onClick: () => onReview(memo.id),
  }
}

interface AnalystTasksProps {
  onNavigateToReview: (memoId: string) => void
}

export default function AnalystTasks({ onNavigateToReview }: AnalystTasksProps) {
  const groups = useMemo<TaskGroup[]>(() => {
    return FLAG_ORDER.map((flag) => {
      const section = FLAG_SECTION[flag]
      const items = MOCK_ANALYST_MEMOS
        .filter((m) => m.flagColor === flag)
        .sort(
          (a, b) =>
            new Date(a.memoDate).getTime() - new Date(b.memoDate).getTime(),
        )
        .map((m) => memoToItem(m, flag, onNavigateToReview))
      return {
        id: flag,
        label: section.label,
        icon: section.icon,
        iconClassName: section.iconClassName,
        items,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onNavigateToReview])

  return (
    <InternalTasks
      title="Tasks"
      subtitle="AI financial memos awaiting review, grouped by flag."
      breadcrumbs={[{ label: 'Tasks' }]}
      groups={groups}
      emptyMessage="No memos pending review."
    />
  )
}
