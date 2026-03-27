import { Check, Circle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { STAGE_LABELS } from '@/components/StageProgressBar'
import { Badge } from '@/components/ui/badge'
import type { DealRoomStage } from '@shared/types/enums'

export interface MilestoneTimelineItem {
  stage: DealRoomStage
  status: 'complete' | 'current' | 'upcoming'
  date?: string
}

interface MilestoneTimelineProps {
  items: MilestoneTimelineItem[]
  className?: string
}

function MilestoneTimeline({ items, className }: MilestoneTimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Vertical line — centered on 24px icons */}
      <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

      <div className="space-y-0">
        {items.map((ms, i) => (
          <div
            key={ms.stage}
            className={cn(
              'flex items-start gap-3',
              i === items.length - 1 ? 'pb-0' : ms.status === 'current' ? 'pb-7' : 'pb-4',
            )}
          >
            {/* Circle indicator */}
            <div className="relative z-10 shrink-0">
              {ms.status === 'complete' && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-mode-sell text-white">
                  <Check size={13} />
                </div>
              )}
              {ms.status === 'current' && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-mode-sell bg-mode-sell/10">
                  <div className="h-2 w-2 rounded-full bg-mode-sell animate-pulse" />
                </div>
              )}
              {ms.status === 'upcoming' && (
                <div className="flex h-6 w-6 items-center justify-center">
                  <Circle size={18} className="text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-sm',
                    ms.status === 'current'
                      ? 'font-semibold text-foreground'
                      : ms.status === 'complete'
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/60',
                  )}
                >
                  Stage {ms.stage} — {STAGE_LABELS[ms.stage]}
                </span>
                {ms.status === 'current' && (
                  <Badge size="sm" className="border-transparent bg-mode-sell/15 text-mode-sell">
                    In Progress
                  </Badge>
                )}
              </div>
              {ms.date && (
                <p className="mt-0.5 text-xs text-muted-foreground/60">{ms.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MilestoneTimeline
