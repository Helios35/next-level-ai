import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Bell } from 'lucide-react'

// ── Notification event types ──────────────────────────────────────────────

interface NotificationEvent {
  id: string
  message: string
  category: 'exception' | 'approval_request' | 'staff_update' | 'system'
  timestamp: string
}

const CATEGORY_LABELS: Record<NotificationEvent['category'], string> = {
  exception: 'Exception',
  approval_request: 'Approval Request',
  staff_update: 'Staff Update',
  system: 'System',
}

const CATEGORY_BADGE_CLASS: Record<NotificationEvent['category'], string> = {
  exception: 'border-red-500/30 bg-red-500/10 text-red-400',
  approval_request: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  staff_update: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  system: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
}

// Static mock for now — real implementation will aggregate from exception queue, staff events, and system
const MOCK_ADMIN_NOTIFICATIONS: NotificationEvent[] = [
  {
    id: 'ad_1',
    message: 'Cypress Creek BFR — Austin · Exception queued: development budget missing line-item detail',
    category: 'exception',
    timestamp: '2026-04-14T09:30:00Z',
  },
  {
    id: 'ad_2',
    message: 'Triangle SFR Portfolio — Raleigh · Exception queued: missing rent roll',
    category: 'exception',
    timestamp: '2026-04-13T18:00:00Z',
  },
  {
    id: 'ad_3',
    message: 'Rachel Torres requested approval to waive QA review for Magnolia Farms BFR',
    category: 'approval_request',
    timestamp: '2026-04-13T14:20:00Z',
  },
  {
    id: 'ad_4',
    message: 'New staff member invitation accepted: Alex Rivera (Analyst)',
    category: 'staff_update',
    timestamp: '2026-04-13T10:05:00Z',
  },
  {
    id: 'ad_5',
    message: 'Harbor View Multifamily — Jacksonville · Operating statement shows unexplained revenue spike',
    category: 'exception',
    timestamp: '2026-04-12T16:45:00Z',
  },
  {
    id: 'ad_6',
    message: 'Nightly pipeline sync completed successfully',
    category: 'system',
    timestamp: '2026-04-12T04:00:00Z',
  },
]

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

export default function AdminNotifications() {
  const notifications = useMemo<NotificationEvent[]>(
    () =>
      [...MOCK_ADMIN_NOTIFICATIONS].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [],
  )

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
      <Breadcrumbs className="mb-4" items={[{ label: 'Notifications' }]} />
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
