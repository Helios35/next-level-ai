import { Clock, FileText, PlusCircle, SearchX } from 'lucide-react'

type BuyerEmptyVariant =
  | 'no-strategy'
  | 'no-matches'
  | 'no-access-requests'
  | 'no-strategies'
  | 'no-drafts'
  | 'no-results'

interface BuyerEmptyStateProps {
  variant: BuyerEmptyVariant
  onCTA?: () => void
  accentMode?: 'buy' | 'strategy'
}

const VARIANT_CONFIG = {
  'no-strategy': {
    icon: PlusCircle,
    heading: 'No strategy yet',
    subtext: 'Create a strategy to start receiving matched deals.',
    ctaLabel: 'Create Your First Strategy',
  },
  'no-matches': {
    icon: SearchX,
    heading: 'No matches yet',
    subtext: 'Your strategy is live. Deals matching your criteria will appear here.',
    ctaLabel: null,
  },
  'no-access-requests': {
    icon: Clock,
    heading: 'No access requests',
    subtext: 'Browse deals and request access from any active listing.',
    ctaLabel: null,
  },
  'no-strategies': {
    icon: PlusCircle,
    heading: 'No strategies yet',
    subtext: 'Create a strategy to start receiving matched deals.',
    ctaLabel: 'Create Your First Strategy',
  },
  'no-drafts': {
    icon: FileText,
    heading: 'No drafts',
    subtext: 'Any strategies you save as drafts will appear here.',
    ctaLabel: null,
  },
  'no-results': {
    icon: SearchX,
    heading: 'No results',
    subtext: 'Try adjusting your filters to see more deals.',
    ctaLabel: 'Clear Filters',
  },
} as const

const ACCENT_CLASSES: Record<string, string> = {
  buy: 'bg-mode-buy hover:bg-mode-buy/90',
  strategy: 'bg-mode-strategy hover:bg-mode-strategy/90',
}

export default function BuyerEmptyState({ variant, onCTA, accentMode = 'buy' }: BuyerEmptyStateProps) {
  const config = VARIANT_CONFIG[variant]
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon size={40} className="text-muted-foreground/40 mb-3" />
      <h3 className="text-base font-semibold text-foreground">{config.heading}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{config.subtext}</p>
      {config.ctaLabel && onCTA && (
        <button
          onClick={onCTA}
          className={`mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${ACCENT_CLASSES[accentMode]}`}
        >
          {config.ctaLabel}
        </button>
      )}
    </div>
  )
}
