import { cn } from '@/utils/cn'
import type { DealRoomStatus } from '@shared/types/enums'

const STATUS_CONFIG: Record<DealRoomStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-green-500/20 text-green-400',
  },
  market_tested: {
    label: 'Market Tested',
    className: 'bg-amber-500/20 text-amber-400',
  },
  dormant: {
    label: 'Dormant',
    className: 'bg-gray-500/20 text-gray-400',
  },
  closed: {
    label: 'Closed',
    className: 'bg-emerald-500/20 text-emerald-300',
  },
  withdrawn: {
    label: 'Withdrawn',
    className: 'bg-red-500/20 text-red-400',
  },
}

interface StatusBadgeProps {
  status: DealRoomStatus
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
