import { useMemo } from 'react'
import { AlertCircle, Clock, Info } from 'lucide-react'
import { MOCK_DS_TASKS } from '@/data/mock/dsTasks'
import InternalTasks, {
  type TaskGroup,
  type TaskItem,
} from '@/components/internal/InternalTasks'
import type { DsTask, DsTaskType, DsTaskUrgency } from '@shared/types/dsTask'

// ── Label maps ────────────────────────────────────────────────────────────

const TASK_TYPE_LABELS: Record<DsTaskType, string> = {
  seat_approval: 'Seat Approval',
  seat_approval_invited: 'Seat Approval — Invited',
  offer_feedback_authorization: 'Offer Feedback',
  pricing_guidance_authorization: 'Pricing Guidance',
  buyer_outreach_authorization: 'Buyer Outreach',
  seller_escalation: 'Seller Escalation',
  buyer_qa_escalation: 'Buyer Q&A Escalation',
  listing_agreement: 'Listing Agreement',
  milestone_logging: 'Milestone Logging',
  market_tested_declaration: 'Market Tested Declaration',
}

const SUBTYPE_LABELS: Record<string, string> = {
  sfr_portfolio: 'SFR Portfolio',
  build_for_rent: 'Build-for-Rent',
  multifamily: 'Multifamily',
  land: 'Land',
}

const URGENCY_SECTION: Record<
  DsTaskUrgency,
  {
    label: string
    icon: typeof AlertCircle
    iconClassName: string
    badgeClassName: string
  }
> = {
  action_required: {
    label: 'Action Required',
    icon: AlertCircle,
    iconClassName: 'text-red-400',
    badgeClassName: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
  review_pending: {
    label: 'Review Pending',
    icon: Clock,
    iconClassName: 'text-amber-400',
    badgeClassName: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  informational: {
    label: 'Informational',
    icon: Info,
    iconClassName: 'text-slate-400',
    badgeClassName: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
  },
}

const URGENCY_ORDER: DsTaskUrgency[] = [
  'action_required',
  'review_pending',
  'informational',
]

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function taskToItem(
  task: DsTask,
  urgency: DsTaskUrgency,
  onNavigate: (dealId: string, tab: string) => void,
): TaskItem {
  const section = URGENCY_SECTION[urgency]
  const subtype = SUBTYPE_LABELS[task.assetSubtype] ?? task.assetSubtype
  const UrgencyIcon = section.icon
  return {
    id: task.id,
    title: task.dealName,
    subtitle: `${subtype} · ${task.geography}`,
    typeLabel: TASK_TYPE_LABELS[task.type],
    badge: {
      label: section.label,
      className: section.badgeClassName,
      icon: UrgencyIcon,
    },
    footer: formatTimestamp(task.createdAt),
    onClick: () => onNavigate(task.dealId, task.targetTab),
  }
}

interface DSTaskQueueProps {
  onNavigateToDeal?: (dealId: string, tab: string) => void
}

export default function DSTaskQueue({ onNavigateToDeal }: DSTaskQueueProps) {
  const handleNavigate = (dealId: string, tab: string) => {
    onNavigateToDeal?.(dealId, tab)
  }

  const groups = useMemo<TaskGroup[]>(() => {
    return URGENCY_ORDER.map((urgency) => {
      const section = URGENCY_SECTION[urgency]
      const items = MOCK_DS_TASKS
        .filter((t) => t.urgency === urgency)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        .map((t) => taskToItem(t, urgency, handleNavigate))
      return {
        id: urgency,
        label: section.label,
        icon: section.icon,
        iconClassName: section.iconClassName,
        items,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onNavigateToDeal])

  return (
    <InternalTasks
      title="Tasks"
      breadcrumbs={[{ label: 'Tasks' }]}
      groups={groups}
    />
  )
}
