import { useState, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { MultiSelect } from '@/components/ui/multi-select'
import { SectionCard } from '@/components/ui/section-card'
import { ReviewRow } from '@/components/ui/review-row'
import { Slider } from '@/components/ui/slider'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Target,
  Layers,
  SlidersHorizontal,
  ClipboardCheck,
  FileText,
  DoorOpen,
} from 'lucide-react'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'

// ── Constants ──────────────────────────────────────────────────────────────

const WIZARD_STEPS = ['Core Criteria', 'Asset Details', 'Refinements', 'Review']

// AssetType
const ASSET_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'residential_income', label: 'Residential Income' },
  { value: 'land', label: 'Land' },
]

// AssetSubType grouped by type
const SUBTYPE_BY_TYPE: Record<string, { value: string; label: string }[]> = {
  residential_income: [
    { value: 'sfr_portfolio', label: 'SFR Portfolio' },
    { value: 'build_for_rent', label: 'Build for Rent' },
    { value: 'multifamily', label: 'Multifamily' },
  ],
  land: [
    { value: 'land', label: 'Land' },
  ],
}

const SUBTYPE_LABELS: Record<string, string> = {
  sfr_portfolio: 'SFR Portfolio',
  build_for_rent: 'Build for Rent',
  multifamily: 'Multifamily',
  land: 'Land',
}

// Tier 2 — Residential Income Group
const PRODUCT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'detached', label: 'Detached' },
  { value: 'townhomes', label: 'Townhomes' },
  { value: 'duplexes', label: 'Duplexes' },
  { value: 'mixed', label: 'Mixed' },
]

const GARAGE_PREFERENCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'required', label: 'Required' },
  { value: 'preferred', label: 'Preferred' },
  { value: 'no_preference', label: 'No preference' },
]

// Tier 2 — Land Group
const LAND_PRODUCT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'sfd', label: 'SFD' },
  { value: 'townhomes', label: 'Townhomes' },
  { value: 'duplexes', label: 'Duplexes' },
  { value: 'multifamily', label: 'Multifamily' },
]

const PRICING_BASIS_OPTIONS: { value: string; label: string }[] = [
  { value: 'per_lot', label: 'Per Lot' },
  { value: 'per_acre', label: 'Per Acre' },
]

// Tier 3 — SFR
const HOA_TOLERANCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'limited', label: 'Limited' },
  { value: 'any', label: 'Any' },
]

const SEPTIC_TOLERANCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'any', label: 'Any' },
]

const SECTION_8_TOLERANCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'limited', label: 'Limited' },
  { value: 'any', label: 'Any' },
]

const VALUE_ADD_TOLERANCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

// Tier 3 — BFR
const LEASE_UP_RISK_OPTIONS: { value: string; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' },
]

const AMENITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'pool', label: 'Pool' },
  { value: 'clubhouse', label: 'Clubhouse' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'none_required', label: 'None required' },
]

const PHASE_SALE_OPTIONS: { value: string; label: string }[] = [
  { value: 'required', label: 'Required' },
  { value: 'preferred', label: 'Preferred' },
  { value: 'not_needed', label: 'Not needed' },
]

// Tier 3 — MF
const MF_VALUE_ADD_OPTIONS: { value: string; label: string }[] = [
  { value: 'core', label: 'Core' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' },
]

// Tier 3 — Land
const TARGET_BASIS_OPTIONS: { value: string; label: string }[] = [
  { value: 'per_lot', label: 'Per Lot' },
  { value: 'per_acre', label: 'Per Acre' },
]

const ENTITLEMENT_DEPTH_OPTIONS: { value: string; label: string }[] = [
  { value: 'raw_ok', label: 'Raw OK' },
  { value: 'submitted_ok', label: 'Submitted OK' },
  { value: 'approved_required', label: 'Approved required' },
  { value: 'recorded_required', label: 'Recorded required' },
]

const DEVELOPMENT_DEPTH_OPTIONS: { value: string; label: string }[] = [
  { value: 'raw_only', label: 'Raw only' },
  { value: 'entitled', label: 'Entitled' },
  { value: 'horizontal_underway', label: 'Horizontal underway' },
  { value: 'finished_lots', label: 'Finished lots only' },
]

const PHASED_TAKEDOWN_OPTIONS: { value: string; label: string }[] = [
  { value: 'required', label: 'Required' },
  { value: 'preferred', label: 'Preferred' },
  { value: 'not_needed', label: 'Not needed' },
]

// ── Section keys ───────────────────────────────────────────────────────────

type SectionKey = 'coreCriteria' | 'assetDetails' | 'refinements' | 'review'

// ── Exported types ─────────────────────────────────────────────────────────

export interface StrategyFormState {
  name: string
  assetType: string
  assetSubType: string
  geography: string
  dealSizeMin: number
  dealSizeMax: number
  tier2Fields: Record<string, unknown>
  tier3Fields: Record<string, unknown>
}

export interface StrategyDraft {
  id: string
  formState: StrategyFormState
  wizardStep: number
  savedAt: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (val: number) => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`
  return `$${val}`
}

const enumLabel = (options: { value: string; label: string }[], val: string) =>
  options.find((o) => o.value === val)?.label ?? val

// ── Component ──────────────────────────────────────────────────────────────

interface CreateStrategyWizardProps {
  step: number
  onSubmit: () => void
  onSaveAsDraft: (formState: StrategyFormState, currentStep: number) => void
  initialState?: StrategyFormState
}

export default function CreateStrategyWizard({
  step,
  onSubmit,
  onSaveAsDraft,
  initialState,
}: CreateStrategyWizardProps) {
  // ── Step 1: Core Criteria (Tier 1) ──────────────────────────────────────
  const [name, setName] = useState(initialState?.name ?? '')
  const [assetType, setAssetType] = useState(initialState?.assetType ?? '')
  const [assetSubType, setAssetSubType] = useState(initialState?.assetSubType ?? '')
  const [geography, setGeography] = useState(initialState?.geography ?? '')
  const [dealSizeRange, setDealSizeRange] = useState<number[]>([
    initialState?.dealSizeMin ?? 5_000_000,
    initialState?.dealSizeMax ?? 25_000_000,
  ])

  // ── Step 2: Asset Details (Tier 2) ──────────────────────────────────────
  // Residential Income group
  const [unitCountMin, setUnitCountMin] = useState<number | ''>(
    (initialState?.tier2Fields?.unitCountMin as number) ?? '',
  )
  const [unitCountMax, setUnitCountMax] = useState<number | ''>(
    (initialState?.tier2Fields?.unitCountMax as number) ?? '',
  )
  const [capRateMin, setCapRateMin] = useState<number | ''>(
    (initialState?.tier2Fields?.capRateMin as number) ?? '',
  )
  const [productType, setProductType] = useState<string[]>(
    (initialState?.tier2Fields?.productType as string[]) ?? [],
  )
  const [sqftMin, setSqftMin] = useState<number | ''>(
    (initialState?.tier2Fields?.sqftMin as number) ?? '',
  )
  const [sqftMax, setSqftMax] = useState<number | ''>(
    (initialState?.tier2Fields?.sqftMax as number) ?? '',
  )
  const [garagePreference, setGaragePreference] = useState(
    (initialState?.tier2Fields?.garagePreference as string) ?? '',
  )
  // Land group
  const [landProductType, setLandProductType] = useState(
    (initialState?.tier2Fields?.landProductType as string) ?? '',
  )
  const [targetUnitCountMin, setTargetUnitCountMin] = useState<number | ''>(
    (initialState?.tier2Fields?.targetUnitCountMin as number) ?? '',
  )
  const [targetUnitCountMax, setTargetUnitCountMax] = useState<number | ''>(
    (initialState?.tier2Fields?.targetUnitCountMax as number) ?? '',
  )
  const [pricingBasis, setPricingBasis] = useState(
    (initialState?.tier2Fields?.pricingBasis as string) ?? '',
  )

  // ── Step 3: Refinements (Tier 3) ────────────────────────────────────────
  // SFR
  const [hoaTolerance, setHoaTolerance] = useState(
    (initialState?.tier3Fields?.hoaTolerance as string) ?? '',
  )
  const [septicTolerance, setSepticTolerance] = useState(
    (initialState?.tier3Fields?.septicTolerance as string) ?? '',
  )
  const [section8Tolerance, setSection8Tolerance] = useState(
    (initialState?.tier3Fields?.section8Tolerance as string) ?? '',
  )
  const [vintagePreference, setVintagePreference] = useState<number | ''>(
    (initialState?.tier3Fields?.vintagePreference as number) ?? '',
  )
  const [bedBathMin, setBedBathMin] = useState(
    (initialState?.tier3Fields?.bedBathMin as string) ?? '',
  )
  const [valueAddTolerance, setValueAddTolerance] = useState(
    (initialState?.tier3Fields?.valueAddTolerance as string) ?? '',
  )
  // BFR
  const [leaseUpRisk, setLeaseUpRisk] = useState(
    (initialState?.tier3Fields?.leaseUpRisk as string) ?? '',
  )
  const [targetPpuMin, setTargetPpuMin] = useState<number | ''>(
    (initialState?.tier3Fields?.targetPpuMin as number) ?? '',
  )
  const [targetPpuMax, setTargetPpuMax] = useState<number | ''>(
    (initialState?.tier3Fields?.targetPpuMax as number) ?? '',
  )
  const [amenityRequirements, setAmenityRequirements] = useState<string[]>(
    (initialState?.tier3Fields?.amenityRequirements as string[]) ?? [],
  )
  const [phaseSalePref, setPhaseSalePref] = useState(
    (initialState?.tier3Fields?.phaseSalePref as string) ?? '',
  )
  // MF
  const [mfVintagePreference, setMfVintagePreference] = useState<number | ''>(
    (initialState?.tier3Fields?.mfVintagePreference as number) ?? '',
  )
  const [mfValueAddTolerance, setMfValueAddTolerance] = useState(
    (initialState?.tier3Fields?.mfValueAddTolerance as string) ?? '',
  )
  // Land
  const [targetBasis, setTargetBasis] = useState(
    (initialState?.tier3Fields?.targetBasis as string) ?? '',
  )
  const [minDensity, setMinDensity] = useState<number | ''>(
    (initialState?.tier3Fields?.minDensity as number) ?? '',
  )
  const [entitlementDepth, setEntitlementDepth] = useState(
    (initialState?.tier3Fields?.entitlementDepth as string) ?? '',
  )
  const [developmentDepth, setDevelopmentDepth] = useState(
    (initialState?.tier3Fields?.developmentDepth as string) ?? '',
  )
  const [phasedTakedown, setPhasedTakedown] = useState(
    (initialState?.tier3Fields?.phasedTakedown as string) ?? '',
  )

  // ── Section collapse state ──────────────────────────────────────────────
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    coreCriteria: false,
    assetDetails: false,
    refinements: false,
    review: false,
  })

  const toggleSection = useCallback((key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  // Auto-expand sections when the AI advances the step
  useEffect(() => {
    if (step >= 1) setOpenSections((prev) => prev.coreCriteria ? prev : { ...prev, coreCriteria: true })
  }, [step >= 1]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (step >= 2) setOpenSections((prev) => prev.assetDetails ? prev : { ...prev, assetDetails: true })
  }, [step >= 2]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (step >= 3) setOpenSections((prev) => prev.refinements ? prev : { ...prev, refinements: true })
  }, [step >= 3]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (step >= 4) setOpenSections((prev) => prev.review ? prev : { ...prev, review: true })
  }, [step >= 4]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Asset Type → SubType dependency ─────────────────────────────────────
  const handleAssetTypeChange = (newType: string) => {
    setAssetType(newType)
    const subtypes = SUBTYPE_BY_TYPE[newType]
    setAssetSubType(subtypes?.[0]?.value ?? '')
  }

  // ── Mock auto-population ────────────────────────────────────────────────
  useEffect(() => {
    if (step >= 1 && !name) {
      setName('Phoenix BFR Portfolio')
      setAssetType('residential_income')
      setAssetSubType('build_for_rent')
      setGeography('Phoenix-Mesa-Chandler, AZ')
      setDealSizeRange([5_000_000, 25_000_000])
    }
  }, [step, name])

  useEffect(() => {
    if (step >= 2 && unitCountMin === '') {
      setUnitCountMin(50)
      setUnitCountMax(200)
      setCapRateMin(5.0)
      setProductType(['detached', 'townhomes'])
      setSqftMin(1200)
      setSqftMax(1800)
      setGaragePreference('preferred')
    }
  }, [step, unitCountMin])

  useEffect(() => {
    if (step >= 3 && assetSubType === 'build_for_rent' && !leaseUpRisk) {
      setLeaseUpRisk('moderate')
      setTargetPpuMin(180_000)
      setTargetPpuMax(220_000)
      setAmenityRequirements(['pool', 'fitness'])
      setPhaseSalePref('preferred')
    }
  }, [step, assetSubType, leaseUpRisk])

  // ── Form snapshot ───────────────────────────────────────────────────────
  const getFormSnapshot = (): StrategyFormState => ({
    name,
    assetType,
    assetSubType,
    geography,
    dealSizeMin: dealSizeRange[0],
    dealSizeMax: dealSizeRange[1],
    tier2Fields: {
      unitCountMin, unitCountMax, capRateMin, productType, sqftMin, sqftMax, garagePreference,
      landProductType, targetUnitCountMin, targetUnitCountMax, pricingBasis,
    },
    tier3Fields: {
      hoaTolerance, septicTolerance, section8Tolerance, vintagePreference, bedBathMin, valueAddTolerance,
      leaseUpRisk, targetPpuMin, targetPpuMax, amenityRequirements, phaseSalePref,
      mfVintagePreference, mfValueAddTolerance,
      targetBasis, minDensity, entitlementDepth, developmentDepth, phasedTakedown,
    },
  })

  // ── Dynamic match computation ────────────────────────────────────────────
  // Normalize asset type for comparison (strategy uses 'residential', deals use 'residential_income')
  const normalizedAssetType = assetType === 'residential_income' ? 'residential_income' : assetType === 'residential' ? 'residential_income' : assetType
  // Normalize sub-type (strategy may use 'bfr', deals use 'build_for_rent')
  const normalizedSubType = assetSubType === 'bfr' ? 'build_for_rent' : assetSubType

  const { matchCount, activeDealRoomCount } = useMemo(() => {
    if (!assetType) return { matchCount: 0, activeDealRoomCount: 0 }

    const matched = MOCK_SELLER_DEAL_ROOMS.filter((d) => {
      if (d.assetType !== normalizedAssetType) return false
      if (assetSubType && d.assetSubType !== normalizedSubType) return false
      if (geography) {
        const dealMsa = (d.shared?.geography as { msa?: string })?.msa ?? ''
        if (!dealMsa.toLowerCase().includes(geography.split(',')[0].toLowerCase())) return false
      }
      return true
    })

    return {
      matchCount: matched.length,
      activeDealRoomCount: matched.filter((d) => d.currentStage >= 6).length,
    }
  }, [assetType, normalizedAssetType, assetSubType, normalizedSubType, geography])

  const subtypeOptions = SUBTYPE_BY_TYPE[assetType] ?? []
  const isLand = assetType === 'land'
  const isResidential = assetType === 'residential_income'
  const subtypeLabel = SUBTYPE_LABELS[assetSubType] ?? assetSubType

  // Determine which Tier 3 sub-type to render
  const isSFR = assetSubType === 'sfr_portfolio'
  const isBFR = assetSubType === 'build_for_rent'
  const isMF = assetSubType === 'multifamily'

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-6 py-6 flex flex-col gap-4">
        {/* ── Progress indicator ────────────────────────────────────── */}
        <div className="flex gap-3">
          {WIZARD_STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'h-1.5 w-full rounded-full transition-colors duration-500',
                  i < step ? 'bg-mode-strategy' : i === step && step > 0 ? 'bg-mode-strategy/40' : 'bg-muted',
                )}
              />
              <span
                className={cn(
                  'text-[11px] transition-colors',
                  i < step ? 'text-mode-strategy font-medium' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Dynamic stats + Save as Draft ──────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-mode-strategy">{matchCount}</span>
              <span className="text-xs text-muted-foreground">{matchCount === 1 ? 'match' : 'matches'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-mode-strategy">
              <DoorOpen size={12} />
              <span>{activeDealRoomCount} active deal room{activeDealRoomCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
          {step >= 1 && (
            <Button
              variant="outline"
              onClick={() => onSaveAsDraft(getFormSnapshot(), step)}
            >
              <FileText data-icon="inline-start" />
              Save as Draft
            </Button>
          )}
        </div>

        {/* ── Step 1: Core Criteria (Tier 1) ──────────────────────── */}
        <SectionCard
          icon={Target}
          iconClassName="text-mode-strategy"
          title="Core Criteria"
          open={openSections.coreCriteria}
          onOpenChange={() => toggleSection('coreCriteria')}
        >
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field className="col-span-2">
              <FieldLabel>Strategy Name</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Phoenix BFR Portfolio"
              />
            </Field>
            <Field>
              <FieldLabel>Asset Type</FieldLabel>
              <Select items={ASSET_TYPE_OPTIONS} value={assetType} onValueChange={handleAssetTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ASSET_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Asset Sub-Type</FieldLabel>
              <Select items={subtypeOptions} value={assetSubType} onValueChange={setAssetSubType} disabled={isLand}>
                <SelectTrigger className={cn('w-full', isLand && 'opacity-60')}>
                  <SelectValue placeholder="Select sub-type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {subtypeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Geography (MSA)</FieldLabel>
              <Input
                value={geography}
                onChange={(e) => setGeography(e.target.value)}
                placeholder="e.g. Phoenix-Mesa-Chandler, AZ"
              />
            </Field>
            <Field>
              <FieldLabel>
                Deal Size Range
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {formatCurrency(dealSizeRange[0])} – {formatCurrency(dealSizeRange[1])}
                </span>
              </FieldLabel>
              <div className="pt-2 px-1">
                <Slider
                  value={dealSizeRange}
                  onValueChange={(val) => setDealSizeRange(val as number[])}
                  min={0}
                  max={100_000_000}
                  step={500_000}
                />
              </div>
            </Field>
          </FieldGroup>
        </SectionCard>

        {/* ── Step 2: Asset Details (Tier 2) ──────────────────────── */}
        <SectionCard
          icon={Layers}
          iconClassName="text-mode-strategy"
          title={`Asset Details — ${subtypeLabel}`}
          open={openSections.assetDetails}
          onOpenChange={() => toggleSection('assetDetails')}
          disabled={step < 1}
        >
          {/* Residential Income group */}
          {isResidential && (
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Unit Count Min</FieldLabel>
                <Input
                  type="number"
                  value={unitCountMin}
                  onChange={(e) => setUnitCountMin(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Unit Count Max</FieldLabel>
                <Input
                  type="number"
                  value={unitCountMax}
                  onChange={(e) => setUnitCountMax(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Cap Rate Min (%)</FieldLabel>
                <Input
                  type="number"
                  step="0.1"
                  value={capRateMin}
                  onChange={(e) => setCapRateMin(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Product Type</FieldLabel>
                <MultiSelect
                  options={PRODUCT_TYPE_OPTIONS}
                  selected={productType}
                  onChange={setProductType}
                  placeholder="Select types..."
                />
              </Field>
              <Field>
                <FieldLabel>Square Footage Min</FieldLabel>
                <Input
                  type="number"
                  value={sqftMin}
                  onChange={(e) => setSqftMin(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Square Footage Max</FieldLabel>
                <Input
                  type="number"
                  value={sqftMax}
                  onChange={(e) => setSqftMax(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Garage Preference</FieldLabel>
                <Select items={GARAGE_PREFERENCE_OPTIONS} value={garagePreference} onValueChange={setGaragePreference}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {GARAGE_PREFERENCE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          )}

          {/* Land group */}
          {isLand && (
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Land Product Type</FieldLabel>
                <Select items={LAND_PRODUCT_TYPE_OPTIONS} value={landProductType} onValueChange={setLandProductType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {LAND_PRODUCT_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Target Unit Count Min</FieldLabel>
                <Input
                  type="number"
                  value={targetUnitCountMin}
                  onChange={(e) => setTargetUnitCountMin(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Target Unit Count Max</FieldLabel>
                <Input
                  type="number"
                  value={targetUnitCountMax}
                  onChange={(e) => setTargetUnitCountMax(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Pricing Basis</FieldLabel>
                <Select items={PRICING_BASIS_OPTIONS} value={pricingBasis} onValueChange={setPricingBasis}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select basis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PRICING_BASIS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          )}
        </SectionCard>

        {/* ── Step 3: Refinements (Tier 3 — optional) ─────────────── */}
        <SectionCard
          icon={SlidersHorizontal}
          iconClassName="text-mode-strategy"
          title={`Refinements — ${subtypeLabel}`}
          open={openSections.refinements}
          onOpenChange={() => toggleSection('refinements')}
          disabled={step < 2}
        >
          {/* SFR Tier 3 */}
          {isSFR && (
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>HOA Tolerance</FieldLabel>
                <Select items={HOA_TOLERANCE_OPTIONS} value={hoaTolerance} onValueChange={setHoaTolerance}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {HOA_TOLERANCE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Septic Tolerance</FieldLabel>
                <Select items={SEPTIC_TOLERANCE_OPTIONS} value={septicTolerance} onValueChange={setSepticTolerance}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SEPTIC_TOLERANCE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Section 8 Tolerance</FieldLabel>
                <Select items={SECTION_8_TOLERANCE_OPTIONS} value={section8Tolerance} onValueChange={setSection8Tolerance}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SECTION_8_TOLERANCE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Vintage Preference (Min Year)</FieldLabel>
                <Input
                  type="number"
                  value={vintagePreference}
                  onChange={(e) => setVintagePreference(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 2000"
                />
              </Field>
              <Field>
                <FieldLabel>Bed/Bath Min</FieldLabel>
                <Input
                  value={bedBathMin}
                  onChange={(e) => setBedBathMin(e.target.value)}
                  placeholder="e.g. 3/2"
                />
              </Field>
              <Field>
                <FieldLabel>Value-Add Tolerance</FieldLabel>
                <Select items={VALUE_ADD_TOLERANCE_OPTIONS} value={valueAddTolerance} onValueChange={setValueAddTolerance}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {VALUE_ADD_TOLERANCE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          )}

          {/* BFR Tier 3 */}
          {isBFR && (
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Lease-Up Risk Appetite</FieldLabel>
                <Select items={LEASE_UP_RISK_OPTIONS} value={leaseUpRisk} onValueChange={setLeaseUpRisk}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {LEASE_UP_RISK_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Target Price Per Unit Min</FieldLabel>
                <Input
                  type="number"
                  value={targetPpuMin}
                  onChange={(e) => setTargetPpuMin(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Target Price Per Unit Max</FieldLabel>
                <Input
                  type="number"
                  value={targetPpuMax}
                  onChange={(e) => setTargetPpuMax(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Phase Sale Preference</FieldLabel>
                <Select items={PHASE_SALE_OPTIONS} value={phaseSalePref} onValueChange={setPhaseSalePref}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PHASE_SALE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field className="col-span-2">
                <FieldLabel>Amenity Requirements</FieldLabel>
                <MultiSelect
                  options={AMENITY_OPTIONS}
                  selected={amenityRequirements}
                  onChange={setAmenityRequirements}
                  placeholder="Select amenities..."
                />
              </Field>
            </FieldGroup>
          )}

          {/* MF Tier 3 */}
          {isMF && (
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Vintage Preference (Min Year)</FieldLabel>
                <Input
                  type="number"
                  value={mfVintagePreference}
                  onChange={(e) => setMfVintagePreference(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 1990"
                />
              </Field>
              <Field>
                <FieldLabel>Value-Add Tolerance</FieldLabel>
                <Select items={MF_VALUE_ADD_OPTIONS} value={mfValueAddTolerance} onValueChange={setMfValueAddTolerance}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {MF_VALUE_ADD_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          )}

          {/* Land Tier 3 */}
          {isLand && (
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Target Basis</FieldLabel>
                <Select items={TARGET_BASIS_OPTIONS} value={targetBasis} onValueChange={setTargetBasis}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {TARGET_BASIS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Min Density (units/acre)</FieldLabel>
                <Input
                  type="number"
                  value={minDensity}
                  onChange={(e) => setMinDensity(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Required Entitlement Depth</FieldLabel>
                <Select items={ENTITLEMENT_DEPTH_OPTIONS} value={entitlementDepth} onValueChange={setEntitlementDepth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {ENTITLEMENT_DEPTH_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Required Development Depth</FieldLabel>
                <Select items={DEVELOPMENT_DEPTH_OPTIONS} value={developmentDepth} onValueChange={setDevelopmentDepth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {DEVELOPMENT_DEPTH_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Phased Takedown Preference</FieldLabel>
                <Select items={PHASED_TAKEDOWN_OPTIONS} value={phasedTakedown} onValueChange={setPhasedTakedown}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PHASED_TAKEDOWN_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          )}

          {/* Skip link */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => {
                // Trigger next step without filling Tier 3
              }}
            >
              Skip refinements
            </button>
          </div>
        </SectionCard>

        {/* ── Step 4: Review ──────────────────────────────────────── */}
        <SectionCard
          icon={ClipboardCheck}
          iconClassName="text-mode-strategy"
          title="Review"
          open={openSections.review}
          onOpenChange={() => toggleSection('review')}
          disabled={step < 3}
        >
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Core Criteria</h4>
            <ReviewRow label="Strategy Name" value={name || '—'} />
            <ReviewRow label="Asset Type" value={enumLabel(ASSET_TYPE_OPTIONS, assetType)} />
            <ReviewRow label="Asset Sub-Type" value={subtypeLabel || '—'} />
            <ReviewRow label="Geography" value={geography || '—'} />
            <ReviewRow label="Deal Size Range" value={`${formatCurrency(dealSizeRange[0])} – ${formatCurrency(dealSizeRange[1])}`} />

            <Separator />

            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Asset Details</h4>
            {isResidential && (
              <>
                <ReviewRow label="Unit Count" value={unitCountMin || unitCountMax ? `${unitCountMin} – ${unitCountMax}` : '—'} />
                <ReviewRow label="Cap Rate Min" value={capRateMin ? `${capRateMin}%` : '—'} />
                <ReviewRow label="Product Type" value={productType.length > 0 ? productType.map((v) => enumLabel(PRODUCT_TYPE_OPTIONS, v)).join(', ') : '—'} />
                <ReviewRow label="Sqft Range" value={sqftMin || sqftMax ? `${sqftMin} – ${sqftMax}` : '—'} />
                <ReviewRow label="Garage" value={garagePreference ? enumLabel(GARAGE_PREFERENCE_OPTIONS, garagePreference) : '—'} />
              </>
            )}
            {isLand && (
              <>
                <ReviewRow label="Land Product Type" value={landProductType ? enumLabel(LAND_PRODUCT_TYPE_OPTIONS, landProductType) : '—'} />
                <ReviewRow label="Target Unit Count" value={targetUnitCountMin || targetUnitCountMax ? `${targetUnitCountMin} – ${targetUnitCountMax}` : '—'} />
                <ReviewRow label="Pricing Basis" value={pricingBasis ? enumLabel(PRICING_BASIS_OPTIONS, pricingBasis) : '—'} />
              </>
            )}

            <Separator />

            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Refinements</h4>
            {isSFR && (
              <>
                {hoaTolerance && <ReviewRow label="HOA Tolerance" value={enumLabel(HOA_TOLERANCE_OPTIONS, hoaTolerance)} />}
                {septicTolerance && <ReviewRow label="Septic Tolerance" value={enumLabel(SEPTIC_TOLERANCE_OPTIONS, septicTolerance)} />}
                {section8Tolerance && <ReviewRow label="Section 8 Tolerance" value={enumLabel(SECTION_8_TOLERANCE_OPTIONS, section8Tolerance)} />}
                {vintagePreference && <ReviewRow label="Vintage Preference" value={String(vintagePreference)} />}
                {bedBathMin && <ReviewRow label="Bed/Bath Min" value={bedBathMin} />}
                {valueAddTolerance && <ReviewRow label="Value-Add Tolerance" value={enumLabel(VALUE_ADD_TOLERANCE_OPTIONS, valueAddTolerance)} />}
              </>
            )}
            {isBFR && (
              <>
                {leaseUpRisk && <ReviewRow label="Lease-Up Risk" value={enumLabel(LEASE_UP_RISK_OPTIONS, leaseUpRisk)} />}
                {(targetPpuMin || targetPpuMax) && <ReviewRow label="Target PPU" value={`${targetPpuMin ? formatCurrency(targetPpuMin as number) : '—'} – ${targetPpuMax ? formatCurrency(targetPpuMax as number) : '—'}`} />}
                {amenityRequirements.length > 0 && <ReviewRow label="Amenities" value={amenityRequirements.map((v) => enumLabel(AMENITY_OPTIONS, v)).join(', ')} />}
                {phaseSalePref && <ReviewRow label="Phase Sale" value={enumLabel(PHASE_SALE_OPTIONS, phaseSalePref)} />}
              </>
            )}
            {isMF && (
              <>
                {mfVintagePreference && <ReviewRow label="Vintage Preference" value={String(mfVintagePreference)} />}
                {mfValueAddTolerance && <ReviewRow label="Value-Add Tolerance" value={enumLabel(MF_VALUE_ADD_OPTIONS, mfValueAddTolerance)} />}
              </>
            )}
            {isLand && (
              <>
                {targetBasis && <ReviewRow label="Target Basis" value={enumLabel(TARGET_BASIS_OPTIONS, targetBasis)} />}
                {minDensity && <ReviewRow label="Min Density" value={`${minDensity} units/acre`} />}
                {entitlementDepth && <ReviewRow label="Entitlement Depth" value={enumLabel(ENTITLEMENT_DEPTH_OPTIONS, entitlementDepth)} />}
                {developmentDepth && <ReviewRow label="Development Depth" value={enumLabel(DEVELOPMENT_DEPTH_OPTIONS, developmentDepth)} />}
                {phasedTakedown && <ReviewRow label="Phased Takedown" value={enumLabel(PHASED_TAKEDOWN_OPTIONS, phasedTakedown)} />}
              </>
            )}
            {!isSFR && !isBFR && !isMF && !isLand && (
              <p className="text-xs text-muted-foreground">No refinements added.</p>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex gap-3">
            <Button
              onClick={onSubmit}
              className="bg-mode-strategy hover:bg-mode-strategy/90 text-white"
            >
              Save Strategy
            </Button>
            <Button
              variant="outline"
              onClick={() => onSaveAsDraft(getFormSnapshot(), step)}
            >
              Save as Draft
            </Button>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
