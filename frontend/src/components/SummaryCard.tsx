import { cn } from '@/utils/cn'
import { Badge } from '@/components/ui/badge'

interface SummaryCardProps {
  title: string
  badge?: string
  children: React.ReactNode
  className?: string
}

function SummaryCard({ title, badge, children, className }: SummaryCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-background p-5 space-y-3', className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {badge && (
          <Badge size="sm" className="border-transparent bg-muted text-muted-foreground">
            {badge}
          </Badge>
        )}
      </div>
      {children}
    </div>
  )
}

export default SummaryCard
