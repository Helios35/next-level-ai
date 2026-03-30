import { FileText, PlusCircle, SearchX } from 'lucide-react'

interface SellerListingsEmptyProps {
  variant: 'no-listings' | 'no-results' | 'no-drafts'
  onCTA?: () => void
}

const VARIANT_CONFIG = {
  'no-listings': {
    icon: PlusCircle,
    heading: 'No listings yet',
    subtext: 'Create your first listing to get started.',
    ctaLabel: 'Create Listing',
  },
  'no-results': {
    icon: SearchX,
    heading: 'No results found',
    subtext: 'Try adjusting your search or clearing your filters.',
    ctaLabel: 'Clear Filters',
  },
  'no-drafts': {
    icon: FileText,
    heading: 'No drafts',
    subtext: 'Any listings you save as drafts will appear here.',
    ctaLabel: null,
  },
} as const

export default function SellerListingsEmpty({ variant, onCTA }: SellerListingsEmptyProps) {
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
          className="mt-4 rounded-lg bg-mode-sell px-4 py-2 text-sm font-medium text-white hover:bg-mode-sell/90 transition-colors"
        >
          {config.ctaLabel}
        </button>
      )}
    </div>
  )
}
