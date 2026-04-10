import { useEffect, useState } from 'react'
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

interface OwnershipGateProps {
  open: boolean
  listingName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function OwnershipGate({ open, listingName, onConfirm, onCancel }: OwnershipGateProps) {
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (open) setChecked(false)
  }, [open])

  if (!open) return null

  return (
    <Dialog open disablePointerDismissal>
      <DialogContent showCloseButton={false} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Confirm Ownership</DialogTitle>
          <DialogDescription className="pt-2">
            By submitting <span className="font-medium text-foreground">{listingName}</span>, you
            confirm that you have the authority to list this asset for sale or disposition on behalf
            of the ownership entity.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="ownership-confirm"
              checked={checked}
              onCheckedChange={(val) => setChecked(val)}
            />
            <Label htmlFor="ownership-confirm" className="text-sm leading-snug cursor-pointer">
              I confirm I have authority to list this asset
            </Label>
          </div>
        </div>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-mode-sell hover:bg-mode-sell/90 text-white"
            disabled={!checked}
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
