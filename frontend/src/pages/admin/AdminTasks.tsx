import { useMemo } from 'react'
import { AlertTriangle, CheckCircle2, UserCog } from 'lucide-react'
import { MOCK_ADMIN_EXCEPTIONS, type AdminException } from '@/data/mock/adminExceptions'
import InternalTasks, {
  type TaskGroup,
  type TaskItem,
} from '@/components/internal/InternalTasks'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function exceptionToItem(
  exc: AdminException,
  onReview: (dealId: string) => void,
): TaskItem {
  return {
    id: exc.id,
    title: exc.dealName,
    subtitle: `${exc.sellerName} · Submitted ${formatDate(exc.dateSubmittedToStage3)}`,
    typeLabel: 'Stage 3 Review',
    badge: {
      label: `${exc.daysPending}d pending`,
      className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    },
    extraBadges: exc.flagReasons.map((reason) => ({
      label: reason,
      className: 'border-red-500/30 bg-red-500/10 text-red-400',
    })),
    onClick: () => onReview(exc.dealId),
  }
}

interface AdminTasksProps {
  onNavigateToDeal: (dealId: string) => void
}

export default function AdminTasks({ onNavigateToDeal }: AdminTasksProps) {
  const groups = useMemo<TaskGroup[]>(() => {
    const exceptions = [...MOCK_ADMIN_EXCEPTIONS]
      .sort(
        (a, b) =>
          new Date(a.dateSubmittedToStage3).getTime() -
          new Date(b.dateSubmittedToStage3).getTime(),
      )
      .map((exc) => exceptionToItem(exc, onNavigateToDeal))

    return [
      {
        id: 'exceptions',
        label: 'Exceptions',
        icon: AlertTriangle,
        iconClassName: 'text-amber-400',
        items: exceptions,
      },
      {
        id: 'approval_requests',
        label: 'Approval Requests',
        icon: CheckCircle2,
        iconClassName: 'text-emerald-400',
        items: [], // Placeholder — populated when approval flow is implemented
      },
      {
        id: 'staff_actions',
        label: 'Staff Actions',
        icon: UserCog,
        iconClassName: 'text-blue-400',
        items: [], // Placeholder — populated when staff actions are implemented
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onNavigateToDeal])

  return (
    <InternalTasks
      title="Tasks"
      subtitle="Exceptions, approval requests, and staff actions."
      breadcrumbs={[{ label: 'Tasks' }]}
      groups={groups}
    />
  )
}
