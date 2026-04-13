import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface QualificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: 'access_request' | 'dashboard'
  onCompleteProfile: () => void
  onSkip: () => void
}

export default function QualificationModal({
  open,
  onOpenChange,
  trigger,
  onCompleteProfile,
  onSkip,
}: QualificationModalProps) {
  if (!open) return null

  const isAccessRequest = trigger === 'access_request'

  const title = isAccessRequest ? 'Strengthen Your Position' : 'Complete Your Buyer Qualification'
  const body = isAccessRequest
    ? 'You can request access without a completed qualification, but qualified buyers are prioritized by our Disposition Specialists for seat allocation.'
    : 'Qualified buyers rank higher for seat allocation. It takes less than 2 minutes.'
  const skipLabel = isAccessRequest ? 'Request Access Anyway' : 'Maybe Later'
  const skipVariant: 'outline' | 'ghost' = isAccessRequest ? 'outline' : 'ghost'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription className="pt-2 text-sm text-muted-foreground">
            {body}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button variant={skipVariant} onClick={onSkip}>
            {skipLabel}
          </Button>
          <Button
            className="bg-mode-buy hover:bg-mode-buy/90 text-white"
            onClick={onCompleteProfile}
          >
            Complete My Qualification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
