import { useMemo } from 'react'
import { MOCK_DS_TASKS } from '@/data/mock/dsTasks'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import type { DsTaskType } from '@shared/types/dsTask'

// ── Notification event generation from mock tasks ─────────────────────────

interface NotificationEvent {
  id: string
  message: string
  category: 'task_created' | 'stage_change' | 'buyer_activity'
  timestamp: string
}

const TASK_TYPE_DESCRIPTIONS: Record<DsTaskType, string> = {
  seat_approval: 'Buyer requested seat access',
  seat_approval_invited: 'Invited buyer accepted — seat confirmation needed',
  offer_feedback_authorization: 'AI generated offer feedback draft — authorization needed',
  pricing_guidance_authorization: 'AI generated pricing guidance — authorization needed',
  buyer_outreach_authorization: 'AI generated buyer outreach batch — authorization needed',
  seller_escalation: 'Seller conversation escalated to DS',
  buyer_qa_escalation: 'Buyer Q&A escalated — DS response needed',
  listing_agreement: 'Deal advanced to Stage 6 — listing agreement required',
  milestone_logging: 'Post-acceptance milestone pending',
  market_tested_declaration: 'Buyer pool exhaustion conditions met — Market Tested review',
}

const CATEGORY_LABELS: Record<NotificationEvent['category'], string> = {
  task_created: 'Task Created',
  stage_change: 'Stage Change',
  buyer_activity: 'Buyer Activity',
}

const CATEGORY_BADGE_CLASS: Record<NotificationEvent['category'], string> = {
  task_created: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  stage_change: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  buyer_activity: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
}

function deriveCategory(type: DsTaskType): NotificationEvent['category'] {
  if (type === 'listing_agreement' || type === 'market_tested_declaration') {
    return 'stage_change'
  }
  if (type === 'seat_approval' || type === 'seat_approval_invited' || type === 'buyer_qa_escalation') {
    return 'buyer_activity'
  }
  return 'task_created'
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ── Component ─────────────────────────────────────────────────────────────

export default function DSNotifications() {
  const notifications = useMemo<NotificationEvent[]>(() => {
    return MOCK_DS_TASKS
      .map((task) => ({
        id: `notif_${task.id}`,
        message: `${task.dealName} — ${TASK_TYPE_DESCRIPTIONS[task.type]}`,
        category: deriveCategory(task.type),
        timestamp: task.createdAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
  }, [])

  if (notifications.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-20">
        <Bell size={32} className="text-slate-500" />
        <p className="text-lg font-medium text-slate-500">No notifications.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          {notifications.length} event{notifications.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-2">
        {notifications.map((event) => (
          <div
            key={event.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm text-foreground">{event.message}</p>
                <div className="flex items-center gap-2">
                  <Badge className={CATEGORY_BADGE_CLASS[event.category]}>
                    {CATEGORY_LABELS[event.category]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
