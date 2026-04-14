import { useMemo } from 'react'
import { MOCK_DS_TASKS } from '@/data/mock/dsTasks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  AlertCircle,
  Clock,
  Info,
} from 'lucide-react'
import type { DsTask, DsTaskUrgency, DsTaskType } from '@shared/types/dsTask'

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

const URGENCY_CONFIG: Record<
  DsTaskUrgency,
  { label: string; className: string; icon: typeof AlertCircle }
> = {
  action_required: {
    label: 'Action Required',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
    icon: AlertCircle,
  },
  review_pending: {
    label: 'Review Pending',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    icon: Clock,
  },
  informational: {
    label: 'Informational',
    className: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
    icon: Info,
  },
}

const URGENCY_ORDER: Record<DsTaskUrgency, number> = {
  action_required: 0,
  review_pending: 1,
  informational: 2,
}

const SUBTYPE_LABELS: Record<string, string> = {
  sfr_portfolio: 'SFR Portfolio',
  build_for_rent: 'Build-for-Rent',
  multifamily: 'Multifamily',
  land: 'Land',
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ── Task Card ─────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onNavigate,
}: {
  task: DsTask
  onNavigate: (dealId: string, tab: string) => void
}) {
  const urgency = URGENCY_CONFIG[task.urgency]
  const UrgencyIcon = urgency.icon

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-slate-500/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Deal name */}
          <h3 className="truncate text-sm font-semibold text-foreground">
            {task.dealName}
          </h3>

          {/* Context line */}
          <p className="text-xs text-muted-foreground">
            {SUBTYPE_LABELS[task.assetSubtype] ?? task.assetSubtype} · {task.geography}
          </p>

          {/* Task type + urgency */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {TASK_TYPE_LABELS[task.type]}
            </Badge>
            <Badge className={urgency.className}>
              <UrgencyIcon size={12} className="mr-1" />
              {urgency.label}
            </Badge>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(task.createdAt)}
          </p>
        </div>

        {/* CTA */}
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 gap-1.5"
          onClick={() => onNavigate(task.dealId, task.targetTab)}
        >
          View
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────

interface DSTaskQueueProps {
  onNavigateToDeal?: (dealId: string, tab: string) => void
}

export default function DSTaskQueue({ onNavigateToDeal }: DSTaskQueueProps) {
  const sortedTasks = useMemo(() => {
    return [...MOCK_DS_TASKS].sort((a, b) => {
      const urgencyDiff = URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]
      if (urgencyDiff !== 0) return urgencyDiff
      // Oldest first within same urgency
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }, [])

  const handleNavigate = (dealId: string, tab: string) => {
    if (onNavigateToDeal) {
      onNavigateToDeal(dealId, tab)
    }
  }

  // Empty state
  if (sortedTasks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-20">
        <p className="text-lg font-medium text-slate-500">No pending tasks.</p>
        <p className="text-sm text-slate-500">All caught up.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3 px-4 py-6 sm:px-6">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-foreground">Task Queue</h1>
        <p className="text-sm text-muted-foreground">
          {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''} pending
        </p>
      </div>

      {sortedTasks.map((task) => (
        <TaskCard key={task.id} task={task} onNavigate={handleNavigate} />
      ))}
    </div>
  )
}
