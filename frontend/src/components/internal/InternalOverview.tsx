import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatTile, StatTileGrid } from '@/components/ui/stat-tile'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/breadcrumbs'

// ── Types ─────────────────────────────────────────────────────────────────

export interface OverviewStatTile {
  value: string | number
  label: string
}

export interface OverviewTopItem {
  id: string
  title: string
  subtitle?: string
  badge?: { label: string; className?: string }
  onClick?: () => void
}

export interface OverviewTaskSummary {
  /** Section title (e.g. "Exception Queue", "Task Queue", "Review Queue") */
  label: string
  icon: LucideIcon
  iconClassName?: string
  /** Total pending items across all tasks — shown in the header badge */
  pendingCount: number
  /** Count badge className — defaults to amber */
  pendingBadgeClassName?: string
  /** Top items displayed inline (up to 3 recommended) */
  topItems: OverviewTopItem[]
  /** "View All" CTA — navigates to the role's Tasks tab */
  onViewAll: () => void
  /** Empty state message when topItems is empty */
  emptyMessage?: string
}

interface InternalOverviewProps {
  title: string
  subtitle: string
  breadcrumbs?: BreadcrumbItem[]
  /** Three stat tiles rendered at the top (Total Deals, Total Tasks, role-specific) */
  stats: OverviewStatTile[]
  taskSummary: OverviewTaskSummary
}

// ── Component ─────────────────────────────────────────────────────────────

export default function InternalOverview({
  title,
  subtitle,
  breadcrumbs,
  stats,
  taskSummary,
}: InternalOverviewProps) {
  const TaskIcon = taskSummary.icon
  const pendingBadgeClass =
    taskSummary.pendingBadgeClassName ??
    'border-amber-500/30 bg-amber-500/10 text-amber-400'

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs className="mb-4" items={breadcrumbs} />
      )}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* ═══ Stat tiles — consistent across every team member's overview ═══ */}
      <StatTileGrid className="mb-8 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatTile key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </StatTileGrid>

      {/* ═══ Task Summary ═══ */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TaskIcon
              size={18}
              className={taskSummary.iconClassName ?? 'text-amber-400'}
            />
            <h2 className="text-base font-semibold text-foreground">
              {taskSummary.label}
            </h2>
            <Badge variant="outline" className={pendingBadgeClass}>
              {taskSummary.pendingCount} pending
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={taskSummary.onViewAll}>
            View All
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </div>

        {taskSummary.topItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {taskSummary.emptyMessage ?? 'No items pending.'}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {taskSummary.topItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                {item.badge && (
                  <Badge
                    variant="outline"
                    className={
                      'shrink-0 ' +
                      (item.badge.className ??
                        'border-slate-500/30 bg-slate-500/10 text-slate-400')
                    }
                  >
                    {item.badge.label}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
