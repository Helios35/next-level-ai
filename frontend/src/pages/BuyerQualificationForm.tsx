import { useState } from 'react'
import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// ── Dropdown options (Fields of Truth) ─────────────────────────────────────

const CAPITAL_SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'equity', label: 'Equity' },
  { value: 'debt', label: 'Debt' },
  { value: 'both', label: 'Both' },
]

const EQUITY_CHECK_OPTIONS: { value: string; label: string }[] = [
  { value: 'under_1m', label: 'Under $1M' },
  { value: '1m_5m', label: '$1M–$5M' },
  { value: '5m_10m', label: '$5M–$10M' },
  { value: '10m_25m', label: '$10M–$25M' },
  { value: '25m_plus', label: '$25M+' },
]

const APPROVAL_PROCESS_OPTIONS: { value: string; label: string }[] = [
  { value: 'discretionary', label: 'Discretionary' },
  { value: 'committee', label: 'Committee' },
  { value: 'other', label: 'Other' },
]

const EXPERIENCE_OPTIONS: { value: string; label: string }[] = [
  { value: '0_2', label: '0–2 years' },
  { value: '3_5', label: '3–5 years' },
  { value: '6_10', label: '6–10 years' },
  { value: '10_plus', label: '10+ years' },
]

const FIRM_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'solo_investor', label: 'Solo Investor' },
  { value: 'builder', label: 'Builder' },
  { value: 'land_developer', label: 'Land Developer' },
  { value: 'operator', label: 'Operator' },
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'capital_allocator', label: 'Capital Allocator' },
  { value: 'other', label: 'Other' },
]

// ── Component ──────────────────────────────────────────────────────────────

interface BuyerQualificationFormProps {
  onComplete: () => void
  onSkip: () => void
}

export default function BuyerQualificationForm({ onComplete, onSkip }: BuyerQualificationFormProps) {
  const [capitalSource, setCapitalSource] = useState('')
  const [equityCheck, setEquityCheck] = useState('')
  const [approvalProcess, setApprovalProcess] = useState('')
  const [experience, setExperience] = useState('')
  const [firmType, setFirmType] = useState('')

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Complete Your Buyer Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            These details help us match you with the right seats. All fields are optional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8">
          {/* Form */}
          <div className="space-y-5">
            <Field>
              <FieldLabel>Capital Source</FieldLabel>
              <Select items={CAPITAL_SOURCE_OPTIONS} value={capitalSource} onValueChange={setCapitalSource}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CAPITAL_SOURCE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Equity Check Size</FieldLabel>
              <Select items={EQUITY_CHECK_OPTIONS} value={equityCheck} onValueChange={setEquityCheck}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {EQUITY_CHECK_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Approval Process</FieldLabel>
              <Select items={APPROVAL_PROCESS_OPTIONS} value={approvalProcess} onValueChange={setApprovalProcess}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {APPROVAL_PROCESS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Experience</FieldLabel>
              <Select items={EXPERIENCE_OPTIONS} value={experience} onValueChange={setExperience}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {EXPERIENCE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Firm Type</FieldLabel>
              <Select items={FIRM_TYPE_OPTIONS} value={firmType} onValueChange={setFirmType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {FIRM_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {/* CTA row */}
            <div className="pt-4 space-y-3">
              <Button
                className="w-full bg-mode-buy text-white hover:bg-mode-buy/80"
                size="lg"
                onClick={onComplete}
              >
                Complete Profile
              </Button>
              <button
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={onSkip}
              >
                Skip for Now
              </button>
            </div>
          </div>

          {/* AI context sidebar */}
          <div className="hidden md:block">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-mode-buy/10 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-mode-buy" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Buyer Profile</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                These details help us match you with the right seats. All fields are optional — you can update them anytime from your profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
