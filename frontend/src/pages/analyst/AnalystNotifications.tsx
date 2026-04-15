import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Bell } from 'lucide-react'

// ── Notification event types ──────────────────────────────────────────────

interface NotificationEvent {
  id: string
  message: string
  category: 'memo_ready' | 'revision_requested' | 'deal_update'
  timestamp: string
}

const CATEGORY_LABELS: Record<NotificationEvent['category'], string> = {
  memo_ready: 'Memo Ready',
  revision_requested: 'Revision Requested',
  deal_update: 'Deal Update',
}

const CATEGORY_BADGE_CLASS: Record<NotificationEvent['category'], string> = {
  memo_ready: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  revision_requested: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  deal_update: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
}

// Static mock for now — real implementation will aggregate from memo queue
const MOCK_ANALYST_NOTIFICATIONS: NotificationEvent[] = [
  {
    id: 'an_1',
    message: 'Pine Ridge Land Parcel — Nashville · AI financial memo ready for review',
    category: 'memo_ready',
    timestamp: '2026-04-14T08:00:00Z',
  },
  {
    id: 'an_2',
    message: 'Lakewood Multifamily — Tampa · Revision requested by DS',
    category: 'revision_requested',
    timestamp: '2026-04-13T16:30:00Z',
  },
  {
    id: 'an_3',
    message: 'Magnolia Farms BFR — Charlotte · Memo approved, moving to DS',
    category: 'deal_update',
    timestamp: '2026-04-13T11:15:00Z',
  },
  {
    id: 'an_4',
    message: 'Sunrise Multifamily — Phoenix · AI financial memo ready for review',
    category: 'memo_ready',
    timestamp: '2026-04-12T14:45:00Z',
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

export default function AnalystNotifications() {
  const notifications = useMemo<NotificationEvent[]>(
    () =>
      [...MOCK_ANALYST_NOTIFICATIONS].sort(
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
