import { cn } from '@/utils/cn'

interface BarChartRowProps {
  label: string
  value: number
  percentage: number
  barClassName?: string
  className?: string
}

function BarChartRow({ label, value, percentage, barClassName, className }: BarChartRowProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="w-36 shrink-0 text-xs text-muted-foreground truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', barClassName ?? 'bg-mode-sell/70')}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-6 shrink-0 text-xs font-medium text-foreground text-right tabular-nums">{value}</span>
    </div>
  )
}

export { BarChartRow }
export type { BarChartRowProps }
