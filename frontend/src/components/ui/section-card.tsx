import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SectionCardProps {
  icon: LucideIcon
  iconClassName?: string
  title: string
  children: React.ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

function SectionCard({
  icon: Icon,
  iconClassName,
  title,
  children,
  className,
  open = true,
  onOpenChange,
  disabled = false,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-background shadow-sm transition-opacity',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => !disabled && onOpenChange?.(!open)}
        disabled={disabled}
        className={cn(
          'flex w-full items-center justify-between p-5',
          !disabled && 'cursor-pointer',
        )}
      >
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon size={16} className={cn('text-mode-sell', iconClassName)} />
          {title}
        </h3>
        <ChevronDown
          size={16}
          className={cn(
            'text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { SectionCard }
export type { SectionCardProps }
