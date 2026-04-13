import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { cn } from '@/utils/cn'
import { notifyDispositionSpecialist } from '@backend/agents/buyerDealRoomStubs'

interface BuyerInactivityNudgeProps {
  daysInactive: number
  dealId: string
  buyerId: string
  onDismiss: () => void
  className?: string
}

export default function BuyerInactivityNudge({
  daysInactive,
  dealId,
  buyerId,
  onDismiss,
  className,
}: BuyerInactivityNudgeProps) {
  useEffect(() => {
    notifyDispositionSpecialist(dealId, buyerId, 'inactivity')
  }, [])

  if (daysInactive < 3) return null

  return (
    <Alert
      className={cn(
        'relative border-mode-buy/30 bg-mode-buy/5',
        className,
      )}
    >
      <p className="text-sm text-foreground pr-6">
        You've been in this deal room for {daysInactive} day{daysInactive === 1 ? '' : 's'} without acting.
        A Disposition Specialist has been notified.
      </p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X size={14} />
      </button>
    </Alert>
  )
}
