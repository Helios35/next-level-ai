import { cn } from '@/utils/cn'
import type { DealRoomStage } from '@shared/types/enums'

const STAGE_LABELS: Record<DealRoomStage, string> = {
  1: 'Deal Submission',
  2: 'Document Collection',
  3: 'Admin QA Review',
  4: 'Analyst Review',
  5: 'Decision Point',
  6: 'Coming Soon',
  7: 'Active Disposition',
  8: 'Offer Negotiation',
  9: 'Accepted Offer',
}

const ALL_STAGES: DealRoomStage[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const BUYER_STAGES: DealRoomStage[] = [6, 7, 8, 9]

const BUYER_STAGE_LABELS: Record<number, string> = {
  6: 'Coming Soon',
  7: 'Active',
  8: 'Offer Round',
  9: 'Accepted',
}

interface StageProgressBarProps {
  currentStage: DealRoomStage
  showLabel?: boolean
  buyerView?: boolean
  className?: string
}

export default function StageProgressBar({
  currentStage,
  showLabel = true,
  buyerView = false,
  className,
}: StageProgressBarProps) {
  const stages = buyerView ? BUYER_STAGES : ALL_STAGES
  const totalStages = stages.length
  const stageIndex = stages.indexOf(currentStage)
  const colorClass = buyerView ? 'bg-mode-buy' : 'bg-mode-sell'

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex gap-1">
        {stages.map((stage) => (
          <div
            key={stage}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              stage <= currentStage ? colorClass : 'bg-muted',
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {buyerView
            ? `Stage ${stageIndex + 1} of ${totalStages} — ${BUYER_STAGE_LABELS[currentStage] ?? STAGE_LABELS[currentStage]}`
            : `Stage ${currentStage} of 9 — ${STAGE_LABELS[currentStage]}`}
        </span>
      )}
    </div>
  )
}

export { STAGE_LABELS }
