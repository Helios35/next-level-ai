import { cn } from '@/utils/cn'

interface ReviewRowProps {
  label: string
  value: string
  className?: string
}

function ReviewRow({ label, value, className }: ReviewRowProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <span className="text-xs font-medium text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  )
}

export { ReviewRow }
export type { ReviewRowProps }
