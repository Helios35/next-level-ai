import { Button } from '@/components/ui/button'

interface OfferIntentGateProps {
  dealName: string
  onInterestedInOffering: () => void
  onPass: () => void
}

export default function OfferIntentGate({ dealName, onInterestedInOffering, onPass }: OfferIntentGateProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-5 space-y-1">
      <p className="text-sm font-medium text-foreground">
        What would you like to do with this deal?
      </p>
      <p className="text-xs text-muted-foreground">
        Indicating interest reserves your seat while you prepare. Passing releases your seat immediately.
      </p>
      <div className="flex gap-3 pt-3">
        <Button
          className="flex-1 bg-mode-buy text-white hover:bg-mode-buy/80"
          onClick={onInterestedInOffering}
        >
          I'm Interested in Offering
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/5"
          onClick={onPass}
        >
          Pass on This Deal
        </Button>
      </div>
    </div>
  )
}
