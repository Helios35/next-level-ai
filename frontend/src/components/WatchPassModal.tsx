import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldLabel } from '@/components/ui/field'

const PASS_REASONS = ['Pricing', 'Timing', 'Asset Type', 'Market', 'Other'] as const

interface WatchPassModalProps {
  open: boolean
  dealName: string
  onConfirm: (reason: string, notes?: string) => void
  onBack: () => void
}

export default function WatchPassModal({ open, dealName, onConfirm, onBack }: WatchPassModalProps) {
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  if (!open) return null

  return (
    <Dialog open disablePointerDismissal>
      <DialogContent showCloseButton={false} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Passing on this deal?</DialogTitle>
          <DialogDescription className="pt-2">
            Once you pass, your seat is released and cannot be reclaimed. Let us know why — your
            feedback helps us improve future matches.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          <Field>
            <FieldLabel>Reason for passing</FieldLabel>
            <Select
              items={PASS_REASONS.map((r) => ({ value: r, label: r }))}
              value={reason}
              onValueChange={(v) => setReason(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reason…" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PASS_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Additional notes (optional)</FieldLabel>
            <textarea
              placeholder="Any other context for your decision…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-md border border-input bg-transparent px-3 py-2 text-sm w-full resize-none h-20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
            />
          </Field>
        </div>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button variant="outline" onClick={onBack}>
            Go Back
          </Button>
          <Button
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={!reason}
            onClick={() => onConfirm(reason, notes || undefined)}
          >
            Confirm Pass
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
