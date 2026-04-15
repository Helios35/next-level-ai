import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionCard } from '@/components/ui/section-card'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/breadcrumbs'

// ── Types ─────────────────────────────────────────────────────────────────

export interface TaskBadge {
  label: string
  className?: string
  icon?: LucideIcon
}

export interface TaskItem {
  id: string
  /** Primary title — usually the deal name */
  title: string
  /** Optional context line — asset type / geography / seller */
  subtitle?: string
  /** Optional type label shown as an outline badge */
  typeLabel?: string
  /** Status/urgency/flag badge shown next to the type label */
  badge?: TaskBadge
  /** Optional footer line — usually a timestamp */
  footer?: string
  /** Extra badges rendered below the main line (e.g. admin flag reasons) */
  extraBadges?: TaskBadge[]
  onClick?: () => void
}

export interface TaskGroup {
  id: string
  label: string
  icon: LucideIcon
  /** Tailwind class for the section-card icon colour */
  iconClassName?: string
  items: TaskItem[]
}

interface InternalTasksProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  groups: TaskGroup[]
  /** Shown when every group is empty */
  emptyMessage?: string
}

// ── Task Card ─────────────────────────────────────────────────────────────

function TaskCard({ task }: { task: TaskItem }) {
  const BadgeIcon = task.badge?.icon
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-slate-500/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {task.title}
          </h3>

          {task.subtitle && (
            <p className="text-xs text-muted-foreground">{task.subtitle}</p>
          )}

          {(task.typeLabel || task.badge) && (
            <div className="flex flex-wrap items-center gap-2">
              {task.typeLabel && (
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground"
                >
                  {task.typeLabel}
                </Badge>
              )}
              {task.badge && (
                <Badge
                  className={
                    task.badge.className ??
                    'border-slate-500/30 bg-slate-500/10 text-slate-400'
                  }
                >
                  {BadgeIcon && <BadgeIcon size={12} className="mr-1" />}
                  {task.badge.label}
                </Badge>
              )}
            </div>
          )}

          {task.extraBadges && task.extraBadges.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {task.extraBadges.map((b, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className={
                    b.className ??
                    'border-slate-500/30 bg-slate-500/10 text-slate-400'
                  }
                >
                  {b.label}
                </Badge>
              ))}
            </div>
          )}

          {task.footer && (
            <p className="text-xs text-muted-foreground">{task.footer}</p>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          className="shrink-0 gap-1.5"
          onClick={task.onClick}
        >
          View
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────

export default function InternalTasks({
  title,
  subtitle,
  breadcrumbs,
  groups,
  emptyMessage = 'No pending tasks. All caught up.',
}: InternalTasksProps) {
  // Track section open state — default open for groups with items, closed if empty
  const [openState, setOpenState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.id, g.items.length > 0])),
  )

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0)

  if (totalItems === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs className="mb-4" items={breadcrumbs} />
        )}
        <div className="mb-4">
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3 px-4 py-6 sm:px-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs className="mb-4" items={breadcrumbs} />
      )}
      <div className="mb-2">
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {totalItems} task{totalItems !== 1 ? 's' : ''} pending
        </p>
      </div>

      {groups.map((group) => (
        <SectionCard
          key={group.id}
          icon={group.icon}
          iconClassName={group.iconClassName}
          title={`${group.label} (${group.items.length})`}
          open={openState[group.id] ?? true}
          onOpenChange={(open) =>
            setOpenState((prev) => ({ ...prev, [group.id]: open }))
          }
        >
          {group.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items in this group.</p>
          ) : (
            <div className="space-y-3">
              {group.items.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </SectionCard>
      ))}
    </div>
  )
}
