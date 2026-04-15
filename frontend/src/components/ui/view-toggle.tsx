import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ViewMode = 'grid' | 'list'

interface ViewToggleProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
  className?: string
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn('flex items-center rounded-lg border border-border', className)}>
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={cn(
          'flex items-center justify-center rounded-l-lg p-2 transition-colors',
          value === 'grid'
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-label="Grid view"
        aria-pressed={value === 'grid'}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={cn(
          'flex items-center justify-center rounded-r-lg p-2 transition-colors',
          value === 'list'
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-label="List view"
        aria-pressed={value === 'list'}
      >
        <List size={16} />
      </button>
    </div>
  )
}
