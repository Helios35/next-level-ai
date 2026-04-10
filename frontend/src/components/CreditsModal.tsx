import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface CreditsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
  mode?: 'view' | 'gate'
  requiredCredits?: number
}

const PURCHASE_OPTIONS = [
  { credits: 100, price: '$100', label: '100 credits · $100' },
  { credits: 500, price: '$450', label: '500 credits · $450' },
  { credits: 1000, price: '$800', label: '1,000 credits · $800' },
] as const

function PurchaseOptions() {
  return (
    <div className="flex flex-col gap-2">
      {PURCHASE_OPTIONS.map((opt) => (
        <Button
          key={opt.credits}
          variant="outline"
          className="w-full justify-between"
          onClick={() => console.log('[Credits] Purchase initiated:', opt.credits)}
        >
          <span>{opt.label}</span>
        </Button>
      ))}
    </div>
  )
}

export default function CreditsModal({
  open,
  onOpenChange,
  currentBalance,
  mode = 'view',
  requiredCredits,
}: CreditsModalProps) {
  if (!open) return null

  if (mode === 'gate') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Credits Required</DialogTitle>
            <DialogDescription className="pt-2">
              You need credits to activate this listing. Purchase credits below to continue.
              {typeof requiredCredits === 'number' && (
                <>
                  {' '}
                  <span className="font-medium text-foreground">
                    {requiredCredits} credits
                  </span>{' '}
                  required, you have{' '}
                  <span className="font-medium text-foreground">{currentBalance}</span>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 py-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Purchase Credits</h4>
            <PurchaseOptions />
          </div>

          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Your Credits</DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{currentBalance}</span>
            <span className="text-sm text-muted-foreground">credits</span>
          </div>

          <p className="text-sm text-muted-foreground">
            Credits are used to activate deal rooms. Your first deal room is free — 400 credits
            included.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Purchase Credits</h4>
            <PurchaseOptions />
          </div>

          <p className="text-xs text-muted-foreground">Transaction history coming soon.</p>
        </div>

        <DialogFooter>
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
