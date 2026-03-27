import { Info, type LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface InfoCalloutProps {
  children: React.ReactNode
  icon?: LucideIcon
  className?: string
}

function InfoCallout({ children, icon: Icon = Info, className }: InfoCalloutProps) {
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3', className)}>
      <Icon size={14} className="shrink-0 mt-0.5 text-muted-foreground/60" />
      <p className="text-xs text-muted-foreground leading-relaxed">{children}</p>
    </div>
  )
}

export { InfoCallout }
export type { InfoCalloutProps }
