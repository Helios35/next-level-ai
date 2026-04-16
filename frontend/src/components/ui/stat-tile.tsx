import { cn } from '@/utils/cn'

interface StatTileProps {
  value: string | number
  label: string
  className?: string
}

function StatTile({ value, label, className }: StatTileProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 rounded-lg bg-background border border-border shadow-sm px-4 py-3 min-w-0',
        className,
      )}
    >
      <span className="text-xl font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground leading-snug">{label}</span>
    </div>
  )
}

interface StatTileGridProps {
  children: React.ReactNode
  className?: string
}

function StatTileGrid({ children, className }: StatTileGridProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {children}
    </div>
  )
}

export { StatTile, StatTileGrid }
export type { StatTileProps, StatTileGridProps }
