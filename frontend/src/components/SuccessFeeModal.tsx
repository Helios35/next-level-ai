import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface SuccessFeeModalProps {
  open: boolean
  dealName: string
  onAccept: () => void
  onDecline: () => void
}

export default function SuccessFeeModal({ open, dealName, onAccept, onDecline }: SuccessFeeModalProps) {
  const [checked, setChecked] = useState(false)

  if (!open) return null

  return (
    <Dialog open disablePointerDismissal>
      <DialogContent showCloseButton={false} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Before You Enter</DialogTitle>
          <DialogDescription className="pt-2">
            Participating in the <span className="font-medium text-foreground">{dealName}</span> deal
            room is subject to a 3% success fee on the gross purchase price, due at closing only. No
            fee is charged if the deal does not close.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="success-fee-agree"
              checked={checked}
              onCheckedChange={(val) => setChecked(val)}
            />
            <Label htmlFor="success-fee-agree" className="text-sm leading-snug cursor-pointer">
              I understand and agree to the 3% success fee agreement.
            </Label>
          </div>
        </div>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button variant="outline" onClick={onDecline}>
            Go Back
          </Button>
          <Button
            className="bg-mode-buy hover:bg-mode-buy/90 text-white"
            disabled={!checked}
            onClick={onAccept}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
