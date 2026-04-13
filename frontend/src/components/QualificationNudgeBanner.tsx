import { X } from 'lucide-react'

interface QualificationNudgeBannerProps {
  onComplete: () => void
  onDismiss: () => void
}

export default function QualificationNudgeBanner({
  onComplete,
  onDismiss,
}: QualificationNudgeBannerProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-mode-buy/20 bg-mode-buy/10 px-4 py-3">
      <p className="text-sm text-foreground">
        Complete your buyer qualification to improve your seat allocation priority.
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onComplete}
          className="rounded-md bg-mode-buy px-3 py-1.5 text-xs font-medium text-white hover:bg-mode-buy/90 transition-colors"
        >
          Complete Qualification
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
