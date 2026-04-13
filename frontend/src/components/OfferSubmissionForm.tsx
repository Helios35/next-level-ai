import { useState, useEffect, useRef } from 'react'
import type { Offer, FinancingType } from '@shared/types/offer'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// ── Currency formatter ────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)

const FINANCING_OPTIONS: { value: string; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'financed', label: 'Financed' },
]

// ── Component ─────────────────────────────────────────────────────────────

interface OfferSubmissionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dealRoomId: string
  round: 1 | 2 | 3
  existingOffer?: Offer
  onSubmit: (offer: Partial<Offer>) => void
}

export default function OfferSubmissionForm({
  open,
  onOpenChange,
  dealRoomId,
  round,
  existingOffer,
  onSubmit,
}: OfferSubmissionFormProps) {
  const [amount, setAmount] = useState('')
  const [financingType, setFinancingType] = useState<FinancingType>('cash')
  const [closingTimelineDays, setClosingTimelineDays] = useState(30)
  const [earnestMoneyAmount, setEarnestMoneyAmount] = useState(0)
  const [terms, setTerms] = useState('')

  // Track whether buyer has manually edited earnest money
  const earnestManuallyEdited = useRef(false)

  // Pre-fill from existing offer or reset to defaults
  useEffect(() => {
    if (existingOffer) {
      setAmount(String(existingOffer.amount))
      setFinancingType(existingOffer.financingType ?? 'cash')
      setClosingTimelineDays(existingOffer.closingTimelineDays ?? 30)
      setEarnestMoneyAmount(existingOffer.earnestMoneyAmount ?? Math.round(existingOffer.amount * 0.03))
      setTerms(existingOffer.terms)
      earnestManuallyEdited.current = false
    } else {
      setAmount('')
      setFinancingType('cash')
      setClosingTimelineDays(30)
      setEarnestMoneyAmount(0)
      setTerms('')
      earnestManuallyEdited.current = false
    }
  }, [existingOffer, open])

  // Auto-calculate earnest money at 3% when amount changes (unless buyer overrode)
  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (!earnestManuallyEdited.current) {
      const parsed = Number(value)
      setEarnestMoneyAmount(parsed > 0 ? Math.round(parsed * 0.03) : 0)
    }
  }

  const handleEarnestChange = (value: string) => {
    earnestManuallyEdited.current = true
    setEarnestMoneyAmount(Number(value) || 0)
  }

  const parsedAmount = Number(amount)
  const isValid = parsedAmount > 0

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit({
      dealRoomId,
      amount: parsedAmount,
      financingType,
      closingTimelineDays,
      earnestMoneyAmount,
      terms,
      round,
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{existingOffer ? 'Update Offer' : 'Submit Offer'}</SheetTitle>
          <SheetDescription>
            {existingOffer
              ? `Updating your Round ${round} offer`
              : `Round ${round} of 3`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-4">
              {/* 1. Offer Amount */}
              <Field>
                <FieldLabel>Offer Amount</FieldLabel>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="pl-6"
                  />
                </div>
              </Field>

              {/* 2. Financing Type */}
              <Field>
                <FieldLabel>Financing Type</FieldLabel>
                <Select items={FINANCING_OPTIONS} value={financingType} onValueChange={(v) => setFinancingType(v as FinancingType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {FINANCING_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              {/* 3. Closing Timeline */}
              <Field>
                <FieldLabel>Closing Timeline</FieldLabel>
                <div className="relative">
                  <Input
                    type="number"
                    min={7}
                    max={120}
                    value={closingTimelineDays}
                    onChange={(e) => setClosingTimelineDays(Number(e.target.value) || 30)}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">days</span>
                </div>
                <FieldDescription>7–120 days</FieldDescription>
              </Field>

              {/* 4. Earnest Money */}
              <Field>
                <FieldLabel>Earnest Money</FieldLabel>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={earnestMoneyAmount || ''}
                    onChange={(e) => handleEarnestChange(e.target.value)}
                    className="pl-6"
                  />
                </div>
                <FieldDescription>Suggested default · adjust as needed</FieldDescription>
              </Field>

              {/* 5. Additional Notes */}
              <Field>
                <FieldLabel>Additional Notes</FieldLabel>
                <textarea
                  placeholder="Any notes or conditions for your offer…"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="rounded-md border border-input bg-transparent px-3 py-2 text-sm w-full resize-none h-24 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
                />
              </Field>
            </div>
        </div>

        <SheetFooter>
          <Button
            className="w-full bg-mode-buy text-white hover:bg-mode-buy/80"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            {existingOffer ? 'Update Offer' : 'Submit Offer'}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
