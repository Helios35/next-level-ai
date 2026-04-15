import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import SellerListingsEmpty from '@/components/SellerListingsEmpty'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Trash2, ArrowRight } from 'lucide-react'
import type { ListingDraft } from '@/pages/CreateListingWizard'

const WIZARD_STEPS = ['Deal Overview', 'Asset Specs', 'Sale Terms', 'Documents', 'Review']

const SUBTYPE_LABELS: Record<string, string> = {
  sfr_portfolio: 'SFR Portfolio',
  build_for_rent: 'Build for Rent',
  multifamily: 'Multifamily',
  land: 'Land',
}

interface SellerDraftsPageProps {
  drafts: ListingDraft[]
  onContinue: (draftId: string) => void
  onDelete: (draftId: string) => void
}

export default function SellerDraftsPage({ drafts, onContinue, onDelete }: SellerDraftsPageProps) {
  if (drafts.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <div className="px-6 py-5 space-y-3">
          <Breadcrumbs items={[{ label: 'Sell' }, { label: 'Drafts' }]} />
          <h1 className="text-lg font-semibold text-foreground">Drafts</h1>
        </div>
        <SellerListingsEmpty variant="no-drafts" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="px-6 py-5 space-y-3">
        <Breadcrumbs items={[{ label: 'Sell' }, { label: 'Drafts' }]} />
        <h1 className="text-lg font-semibold text-foreground">Drafts</h1>
      </div>
      <div className="px-6 pb-6 space-y-3">
        {drafts.map((draft) => {
          const name = draft.formState.propertyName || 'Untitled Draft'
          const subtype = SUBTYPE_LABELS[draft.formState.assetSubType] ?? ''
          const stepsCompleted = draft.wizardStep
          const currentStepLabel = WIZARD_STEPS[draft.wizardStep] ?? ''
          const savedDate = new Date(draft.savedAt)
          const timeStr = savedDate.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })

          return (
            <div
              key={draft.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4"
            >
              {/* Left: name + type */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">{name}</span>
                  {subtype && (
                    <Badge variant="outline" className="shrink-0 text-[11px]">
                      {subtype}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">Saved {timeStr}</span>
              </div>

              {/* Middle: step completion */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex gap-1">
                  {WIZARD_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-6 rounded-full ${
                        i < stepsCompleted ? 'bg-mode-sell' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Step {stepsCompleted} of {WIZARD_STEPS.length} — {currentStepLabel}
                </span>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(draft.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
                <Button
                  onClick={() => onContinue(draft.id)}
                  className="bg-mode-sell hover:bg-mode-sell/80 text-white"
                  size="sm"
                >
                  Continue
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
