import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface AiTip {
  id: string
  icon: LucideIcon
  label: string
  description?: string
  prompt: string
  featured?: boolean
}

interface AiTipCardProps {
  tip: AiTip
  accentClass?: string
  onClick?: (prompt: string) => void
  disabled?: boolean
}

export function AiTipCard({ tip, accentClass, onClick, disabled }: AiTipCardProps) {
  const Icon = tip.icon

  return (
    <button
      onClick={() => onClick?.(tip.prompt)}
      disabled={disabled}
      className={cn(
        'group flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors',
        tip.featured
          ? cn('border-current/20 bg-current/15', accentClass)
          : 'border-border bg-background/60',
        disabled
          ? 'cursor-default opacity-50'
          : 'cursor-pointer hover:bg-muted hover:border-muted-foreground/20',
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg',
          tip.featured
            ? cn('bg-current/15', accentClass)
            : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            'text-xs font-medium leading-tight',
            tip.featured ? cn(accentClass) : 'text-foreground',
          )}
        >
          {tip.label}
        </p>
        {tip.description && (
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {tip.description}
          </p>
        )}
      </div>
    </button>
  )
}

interface AiTipListProps {
  tips: AiTip[]
  accentClass?: string
  onTipClick?: (prompt: string) => void
  disabled?: boolean
}

export function AiTipList({ tips, accentClass, onTipClick, disabled }: AiTipListProps) {
  if (tips.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-2 px-3 pb-2">
      {tips.map((tip) => (
        <AiTipCard
          key={tip.id}
          tip={tip}
          accentClass={accentClass}
          onClick={onTipClick}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
