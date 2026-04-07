import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { MultiSelect } from '@/components/ui/multi-select'
import { NestedSelect } from '@/components/ui/nested-select'
import { SectionCard } from '@/components/ui/section-card'
import { ReviewRow } from '@/components/ui/review-row'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DocumentListItem, DocumentListGroup } from '@/components/ui/document-list-item'
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
  Building2,
  Layers,
  Scale,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  Upload,
  RefreshCw,
} from 'lucide-react'

// ── Constants ──────────────────────────────────────────────────────────────

const WIZARD_STEPS = ['Deal Overview', 'Asset Specs', 'Asset Details', 'Documents', 'Review']

// AssetType (top-level class)
const ASSET_CLASS_OPTIONS: { value: string; label: string }[] = [
  { value: 'residential_income', label: 'Residential Income' },
  { value: 'land', label: 'Land' },
]

// AssetSubType grouped by class
const SUBTYPE_BY_CLASS: Record<string, { value: string; label: string }[]> = {
  residential_income: [
    { value: 'sfr_portfolio', label: 'SFR Portfolio' },
    { value: 'build_for_rent', label: 'Build for Rent' },
    { value: 'multifamily', label: 'Multifamily' },
  ],
  land: [
    { value: 'land', label: 'Land' },
  ],
}

// Friendly subtype labels (for section titles, review)
const SUBTYPE_LABELS: Record<string, string> = {
  sfr_portfolio: 'SFR Portfolio',
  build_for_rent: 'Build for Rent',
  multifamily: 'Multifamily',
  land: 'Land',
}

// DealStage enum
const DEAL_STAGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'pre_development', label: 'Pre-Development' },
  { value: 'in_development', label: 'In Development' },
  { value: 'delivered_vacant', label: 'Delivered Vacant' },
  { value: 'lease_up', label: 'Lease-Up' },
  { value: 'stabilized', label: 'Stabilized' },
]

// PricingPosture enum
const PRICING_POSTURE_OPTIONS: { value: string; label: string }[] = [
  { value: 'exact_price', label: 'Exact Price' },
  { value: 'price_range', label: 'Price Range' },
  { value: 'needs_guidance', label: 'Needs Guidance' },
]

// BFRProductType enum
const BFR_PRODUCT_TYPES: { value: string; label: string }[] = [
  { value: 'detached', label: 'Detached' },
  { value: 'townhomes', label: 'Townhomes' },
  { value: 'duplexes', label: 'Duplexes' },
  { value: 'mixed', label: 'Mixed' },
]

// DevelopmentStatus enum — grouped logically
const DEVELOPMENT_STATUS_OPTIONS: { value: string; label: string; group: string }[] = [
  { value: 'raw_no_submission', label: 'Raw / No Submission', group: 'Pre-Construction' },
  { value: 'concept_plan_prepared', label: 'Concept Plan Prepared', group: 'Pre-Construction' },
  { value: 'submitted_for_entitlement', label: 'Submitted for Entitlement', group: 'Pre-Construction' },
  { value: 'entitled_approved', label: 'Entitled / Approved', group: 'Pre-Construction' },
  { value: 'recorded_platted', label: 'Recorded / Platted', group: 'Pre-Construction' },
  { value: 'horizontal_under_construction', label: 'Horizontal Under Construction', group: 'Construction' },
  { value: 'horizontals_complete', label: 'Horizontals Complete', group: 'Construction' },
  { value: 'vertical_under_construction', label: 'Vertical Under Construction', group: 'Construction' },
  { value: 'vertical_substantially_complete', label: 'Vertical Substantially Complete', group: 'Construction' },
  { value: 'delivered_co_in_process', label: 'Delivered \u2014 CO in Process', group: 'Delivery' },
  { value: 'delivered_co_complete', label: 'Delivered \u2014 CO Complete', group: 'Delivery' },
  { value: 'lease_up_underway', label: 'Lease-Up Underway', group: 'Lease-Up' },
  { value: 'stabilized_operations', label: 'Stabilized Operations', group: 'Stabilized' },
]

// DevelopmentStatus grouped for two-level dropdown
const DEVELOPMENT_STATUS_GROUPS = [
  { label: 'Pre-Construction', options: [
    { value: 'raw_no_submission', label: 'Raw / No Submission' },
    { value: 'concept_plan_prepared', label: 'Concept Plan Prepared' },
    { value: 'submitted_for_entitlement', label: 'Submitted for Entitlement' },
    { value: 'entitled_approved', label: 'Entitled / Approved' },
    { value: 'recorded_platted', label: 'Recorded / Platted' },
  ]},
  { label: 'Construction', options: [
    { value: 'horizontal_under_construction', label: 'Horizontal Under Construction' },
    { value: 'horizontals_complete', label: 'Horizontals Complete' },
    { value: 'vertical_under_construction', label: 'Vertical Under Construction' },
    { value: 'vertical_substantially_complete', label: 'Vertical Substantially Complete' },
  ]},
  { label: 'Delivery', options: [
    { value: 'delivered_co_in_process', label: 'Delivered \u2014 CO in Process' },
    { value: 'delivered_co_complete', label: 'Delivered \u2014 CO Complete' },
  ]},
  { label: 'Lease-Up', options: [
    { value: 'lease_up_underway', label: 'Lease-Up Underway' },
  ]},
  { label: 'Stabilized', options: [
    { value: 'stabilized_operations', label: 'Stabilized Operations' },
  ]},
]

// SaleWindow enum
const SALE_WINDOW_OPTIONS: { value: string; label: string }[] = [
  { value: 'immediate', label: 'Immediate' },
  { value: '3_6_months', label: '3\u20136 Months' },
  { value: '6_12_months', label: '6\u201312 Months' },
  { value: '12_plus_months', label: '12+ Months' },
]

// DealRoomStage (1-9 lifecycle)
const STAGE_LABELS: Record<number, string> = {
  1: 'Pre-LOI',
  2: 'LOI Submitted',
  3: 'LOI Accepted',
  4: 'Due Diligence',
  5: 'PSA Signed',
  6: 'Under Contract',
  7: 'Closing Scheduled',
  8: 'Closed',
  9: 'Post-Close',
}

// BFR Tier 3 — Lease-Up Risk Appetite
const LEASE_UP_RISK_OPTIONS: { value: string; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' },
]

// BFR Tier 3 — Amenity Requirements
const AMENITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'pool', label: 'Pool' },
  { value: 'clubhouse', label: 'Clubhouse' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'none_required', label: 'None required' },
]

// BFR Tier 3 — Phase Sale Preference
const PHASE_SALE_PREF_OPTIONS: { value: string; label: string }[] = [
  { value: 'required', label: 'Required' },
  { value: 'preferred', label: 'Preferred' },
  { value: 'not_needed', label: 'Not needed' },
]

// SFR Tier 3 — HOA Status (seller side of HOA Tolerance)
const HOA_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

// SFR Tier 3 — Sewer Type (seller side of Septic Tolerance)
const SEWER_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'city', label: 'City Sewer' },
  { value: 'septic', label: 'Septic' },
]

// SFR Tier 3 — Section 8 Policy (seller side of Section 8 Tolerance)
const SECTION_8_POLICY_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'limited', label: 'Limited' },
  { value: 'any', label: 'Any' },
]

// SFR Tier 3 — Property Condition (seller side of Value-Add Tolerance)
const SFR_CONDITION_OPTIONS: { value: string; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

// MF Tier 3 — Deferred Maintenance (seller side of Value-Add Tolerance)
const MF_DEFERRED_MAINTENANCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' },
]

// Land Tier 3 — Target Basis (seller side)
const TARGET_BASIS_OPTIONS: { value: string; label: string }[] = [
  { value: 'per_lot', label: 'Per Lot' },
  { value: 'per_acre', label: 'Per Acre' },
]

// Land Tier 3 — Entitlement Depth (seller side of Required Entitlement Depth)
const ENTITLEMENT_DEPTH_OPTIONS: { value: string; label: string }[] = [
  { value: 'raw', label: 'Raw' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'recorded', label: 'Recorded' },
]

// Land Tier 3 — Development Depth (seller side of Required Development Depth)
const DEVELOPMENT_DEPTH_OPTIONS: { value: string; label: string }[] = [
  { value: 'raw_only', label: 'Raw only' },
  { value: 'entitled', label: 'Entitled' },
  { value: 'horizontal_underway', label: 'Horizontal underway' },
  { value: 'finished_lots', label: 'Finished lots only' },
]

// Garage Preference — Tier 2 Residential Income Group
const GARAGE_PREFERENCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'required', label: 'Required' },
  { value: 'preferred', label: 'Preferred' },
  { value: 'no_preference', label: 'No preference' },
]

// Land Product Type — Tier 2 Land Group
const LAND_PRODUCT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'sfd', label: 'SFD' },
  { value: 'townhomes', label: 'Townhomes' },
  { value: 'duplexes', label: 'Duplexes' },
  { value: 'multifamily', label: 'Multifamily' },
]

// Pricing Basis — Tier 2 Land Group
const PRICING_BASIS_OPTIONS: { value: string; label: string }[] = [
  { value: 'per_lot', label: 'Per Lot' },
  { value: 'per_acre', label: 'Per Acre' },
]

// ── Section keys ────────────────────────────────────────────────────────────

type SectionKey = 'dealOverview' | 'assetSpecs' | 'saleTerms' | 'documents' | 'review'

// ── Exported types for draft state ──────────────────────────────────────────

export interface WizardFormState {
  propertyName: string
  assetClass: string
  assetSubType: string
  locationMsa: string
  currentDevelopmentStatus: string
  pricingPosture: string
  exactPrice: number | ''
  priceRangeMin: number | ''
  priceRangeMax: number | ''
  productType: string
  unitCount: number | ''
  sqftMin?: number | ''
  sqftMax?: number | ''
  garagePreference?: string
  landProductType?: string
  pricingBasis?: string
  stageNumber: number
  // BFR Tier 3
  leaseUpRisk?: string
  targetPpuMin?: number | ''
  targetPpuMax?: number | ''
  amenityRequirements?: string[]
  phaseSalePref?: string
  // SFR Tier 3
  hoaStatus?: string
  sewerType?: string
  section8Policy?: string
  yearBuilt?: number | ''
  bedCount?: number | ''
  bathCount?: number | ''
  propertyCondition?: string
  // MF Tier 3
  mfYearBuilt?: number | ''
  deferredMaintenance?: string
  // Land Tier 3
  targetBasis?: string
  projectedDensity?: number | ''
  entitlementDepth?: string
  developmentDepth?: string
  phasedTakedownAllowed?: string
  documents: { name: string; status: string }[]
}

export interface ListingDraft {
  id: string
  formState: WizardFormState
  wizardStep: number
  savedAt: string
}

// ── Component ───────────────────────────────────────────────────────────────

interface CreateListingWizardProps {
  step: number
  onSubmit: () => void
  onSaveAsDraft?: (snapshot: WizardFormState, currentStep: number) => void
  initialState?: Partial<WizardFormState>
  documents?: { name: string; status: string; fileName?: string }[]
  onDocumentUpload?: (docName: string, fileName: string) => void
}

export default function CreateListingWizard({ step, onSubmit, onSaveAsDraft, initialState, documents: externalDocuments, onDocumentUpload }: CreateListingWizardProps) {
  // ── Step 1: Deal Overview (Tier 1 — DealRoomSharedCriteria) ─────────────
  const [propertyName, setPropertyName] = useState(initialState?.propertyName ?? '')
  const [assetClass, setAssetClass] = useState(initialState?.assetClass ?? '')
  const [assetSubType, setAssetSubType] = useState(initialState?.assetSubType ?? '')
  const [locationMsa, setLocationMsa] = useState(initialState?.locationMsa ?? '')
  const [currentDevelopmentStatus, setCurrentDevelopmentStatus] = useState(initialState?.currentDevelopmentStatus ?? '')
  const [pricingPosture, setPricingPosture] = useState(initialState?.pricingPosture ?? '')
  const [exactPrice, setExactPrice] = useState<number | ''>(initialState?.exactPrice ?? '')
  const [priceRangeMin, setPriceRangeMin] = useState<number | ''>(initialState?.priceRangeMin ?? '')
  const [priceRangeMax, setPriceRangeMax] = useState<number | ''>(initialState?.priceRangeMax ?? '')

  // ── Step 2: Asset Specs (Tier 2 — UniqueCriteria) ──────────────────────
  const [productType, setProductType] = useState(initialState?.productType ?? '')
  const [unitCount, setUnitCount] = useState<number | ''>(initialState?.unitCount ?? '')
  const [sqftMin, setSqftMin] = useState<number | ''>(initialState?.sqftMin ?? '')
  const [sqftMax, setSqftMax] = useState<number | ''>(initialState?.sqftMax ?? '')
  const [garagePreference, setGaragePreference] = useState(initialState?.garagePreference ?? '')
  const [landProductType, setLandProductType] = useState(initialState?.landProductType ?? '')
  const [pricingBasis, setPricingBasis] = useState(initialState?.pricingBasis ?? '')

  // ── Step 3: Asset Details (Tier 3 — soft refinement) ────────────────────
  const [stageNumber, setStageNumber] = useState(initialState?.stageNumber ?? 1)
  const [leaseUpRisk, setLeaseUpRisk] = useState(initialState?.leaseUpRisk ?? '')
  const [targetPpuMin, setTargetPpuMin] = useState<number | ''>(initialState?.targetPpuMin ?? '')
  const [targetPpuMax, setTargetPpuMax] = useState<number | ''>(initialState?.targetPpuMax ?? '')
  const [amenityRequirements, setAmenityRequirements] = useState<string[]>(initialState?.amenityRequirements ?? [])
  const [phaseSalePref, setPhaseSalePref] = useState(initialState?.phaseSalePref ?? '')
  // SFR Tier 3
  const [hoaStatus, setHoaStatus] = useState(initialState?.hoaStatus ?? '')
  const [sewerType, setSewerType] = useState(initialState?.sewerType ?? '')
  const [section8Policy, setSection8Policy] = useState(initialState?.section8Policy ?? '')
  const [yearBuilt, setYearBuilt] = useState<number | ''>(initialState?.yearBuilt ?? '')
  const [bedCount, setBedCount] = useState<number | ''>(initialState?.bedCount ?? '')
  const [bathCount, setBathCount] = useState<number | ''>(initialState?.bathCount ?? '')
  const [propertyCondition, setPropertyCondition] = useState(initialState?.propertyCondition ?? '')
  // MF Tier 3
  const [mfYearBuilt, setMfYearBuilt] = useState<number | ''>(initialState?.mfYearBuilt ?? '')
  const [deferredMaintenance, setDeferredMaintenance] = useState(initialState?.deferredMaintenance ?? '')
  // Land Tier 3
  const [targetBasis, setTargetBasis] = useState(initialState?.targetBasis ?? '')
  const [projectedDensity, setProjectedDensity] = useState<number | ''>(initialState?.projectedDensity ?? '')
  const [entitlementDepth, setEntitlementDepth] = useState(initialState?.entitlementDepth ?? '')
  const [developmentDepth, setDevelopmentDepth] = useState(initialState?.developmentDepth ?? '')
  const [phasedTakedownAllowed, setPhasedTakedownAllowed] = useState(initialState?.phasedTakedownAllowed ?? '')

  // ── Step 4: Documents ───────────────────────────────────────────────────
  const [internalDocuments, setInternalDocuments] = useState<{ name: string; status: string }[]>(initialState?.documents ?? [])
  const documents = externalDocuments ?? internalDocuments

  // File picker for wizard-side uploads
  const wizardFileInputRef = useRef<HTMLInputElement>(null)
  const pendingDocLabelRef = useRef('')

  const openWizardFilePicker = useCallback((docLabel: string) => {
    pendingDocLabelRef.current = docLabel
    wizardFileInputRef.current?.click()
  }, [])

  const handleWizardFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && pendingDocLabelRef.current) {
      if (onDocumentUpload) {
        onDocumentUpload(pendingDocLabelRef.current, file.name)
      } else {
        // Fallback: update internal state if no external handler
        setInternalDocuments((prev) =>
          prev.map((d) => (d.name === pendingDocLabelRef.current ? { ...d, status: 'uploaded' } : d)),
        )
      }
    }
    e.target.value = ''
    pendingDocLabelRef.current = ''
  }, [onDocumentUpload])

  // ── Section collapse state ──────────────────────────────────────────────
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    dealOverview: false,
    assetSpecs: false,
    saleTerms: false,
    documents: false,
    review: false,
  })

  const toggleSection = useCallback((key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  // Auto-expand sections when the AI advances the step
  useEffect(() => {
    if (step >= 1) setOpenSections((prev) => prev.dealOverview ? prev : { ...prev, dealOverview: true })
  }, [step >= 1]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (step >= 2) setOpenSections((prev) => prev.assetSpecs ? prev : { ...prev, assetSpecs: true })
  }, [step >= 2]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (step >= 3) setOpenSections((prev) => prev.saleTerms ? prev : { ...prev, saleTerms: true })
  }, [step >= 3]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (step >= 4) setOpenSections((prev) => prev.documents ? prev : { ...prev, documents: true })
  }, [step >= 4]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (step >= 5) setOpenSections((prev) => prev.review ? prev : { ...prev, review: true })
  }, [step >= 5]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Asset Class → SubType dependency ────────────────────────────────────
  const handleAssetClassChange = (newClass: string) => {
    setAssetClass(newClass)
    const subtypes = SUBTYPE_BY_CLASS[newClass]
    setAssetSubType(subtypes?.[0]?.value ?? '')
  }

  // ── Populate mock data as conversation advances ─────────────────────────
  useEffect(() => {
    if (step >= 1 && !propertyName) {
      setPropertyName('Riverside Commons BFR')
      setAssetClass('residential_income')
      setAssetSubType('build_for_rent')
      setLocationMsa('Atlanta-Sandy Springs-Alpharetta, GA')
      setCurrentDevelopmentStatus('vertical_under_construction')
      setPricingPosture('exact_price')
      setExactPrice(8_400_000)
    }
  }, [step, propertyName])

  useEffect(() => {
    if (step >= 2 && !productType) {
      setProductType('detached')
      setUnitCount(42)
      setSqftMin(1200)
      setSqftMax(1800)
      setGaragePreference('preferred')
    }
  }, [step, productType])

  useEffect(() => {
    if (step >= 3 && stageNumber === 1) {
      setStageNumber(4)
    }
  }, [step, stageNumber])

  useEffect(() => {
    if (step >= 3 && assetSubType === 'build_for_rent' && !leaseUpRisk) {
      setLeaseUpRisk('moderate')
      setTargetPpuMin(180_000)
      setTargetPpuMax(220_000)
      setAmenityRequirements(['pool', 'fitness'])
      setPhaseSalePref('preferred')
    }
  }, [step, assetSubType, leaseUpRisk])

  useEffect(() => {
    if (!externalDocuments && step >= 4 && internalDocuments.length === 0) {
      setInternalDocuments([
        { name: 'Purchase & Sale Agreement', status: 'pending' },
        { name: 'Survey / Site Plan', status: 'pending' },
        { name: 'Pro Forma', status: 'pending' },
      ])
    }
  }, [step, internalDocuments.length, externalDocuments])

  // ── Helpers ─────────────────────────────────────────────────────────────
  const formatCurrency = (val: number | '') => {
    if (val === '') return ''
    return new Intl.NumberFormat('en-US').format(val)
  }

  const parseCurrency = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '')
    return digits ? Number(digits) : '' as const
  }

  const enumLabel = (options: { value: string; label: string }[], val: string) =>
    options.find((o) => o.value === val)?.label ?? val

  const getFormSnapshot = (): WizardFormState => ({
    propertyName, assetClass, assetSubType, locationMsa, currentDevelopmentStatus,
    pricingPosture, exactPrice, priceRangeMin, priceRangeMax,
    productType, unitCount, sqftMin, sqftMax, garagePreference,
    landProductType, pricingBasis,
    stageNumber,
    leaseUpRisk, targetPpuMin, targetPpuMax, amenityRequirements, phaseSalePref,
    hoaStatus, sewerType, section8Policy, yearBuilt, bedCount, bathCount, propertyCondition,
    mfYearBuilt, deferredMaintenance,
    targetBasis, projectedDensity, entitlementDepth, developmentDepth, phasedTakedownAllowed,
    documents,
  })

  const subtypeOptions = SUBTYPE_BY_CLASS[assetClass] ?? []
  const isLand = assetClass === 'land'
  const subtypeLabel = SUBTYPE_LABELS[assetSubType] ?? assetSubType

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
                  i < step ? 'bg-mode-sell' : i === step && step > 0 ? 'bg-mode-sell/40' : 'bg-muted',
                )}
              />
              <span
                className={cn(
                  'text-[11px] transition-colors',
                  i < step ? 'text-mode-sell font-medium' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Save as Draft action ─────────────────────────────────── */}
        {step >= 1 && onSaveAsDraft && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onSaveAsDraft(getFormSnapshot(), step)}
            >
              <FileText data-icon="inline-start" />
              Save as Draft
            </Button>
          </div>
        )}

        {/* ── Step 1: Deal Overview (Tier 1 — Shared Criteria) ─────── */}
        <SectionCard
          icon={Building2}
          title="Deal Overview"
          open={openSections.dealOverview}
          onOpenChange={() => toggleSection('dealOverview')}
        >
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field className="col-span-2">
              <FieldLabel>Property Name</FieldLabel>
              <Input
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Asset Type</FieldLabel>
              <Select items={ASSET_CLASS_OPTIONS} value={assetClass} onValueChange={handleAssetClassChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ASSET_CLASS_OPTIONS.map((o) => (
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
                  <SelectValue placeholder="Select type" />
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
                value={locationMsa}
                onChange={(e) => setLocationMsa(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Current Development Status</FieldLabel>
              <NestedSelect
                groups={DEVELOPMENT_STATUS_GROUPS}
                value={currentDevelopmentStatus}
                onValueChange={setCurrentDevelopmentStatus}
                placeholder="Select status"
                className="w-full"
              />
            </Field>
            <Field>
              <FieldLabel>Pricing Posture</FieldLabel>
              <ToggleGroup
                type="single"
                variant="outline"
                value={pricingPosture}
                onValueChange={(val) => { if (val) setPricingPosture(val) }}
                className="w-full"
              >
                {PRICING_POSTURE_OPTIONS.map((opt) => (
                  <ToggleGroupItem key={opt.value} value={opt.value} className="flex-1 text-xs">
                    {opt.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
            {pricingPosture === 'exact_price' && (
              <Field>
                <FieldLabel>Asking Price</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    value={formatCurrency(exactPrice)}
                    onChange={(e) => setExactPrice(parseCurrency(e.target.value))}
                    className="pl-7"
                  />
                </div>
              </Field>
            )}
            {pricingPosture === 'price_range' && (
              <>
                <Field>
                  <FieldLabel>Min Price</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      value={formatCurrency(priceRangeMin)}
                      onChange={(e) => setPriceRangeMin(parseCurrency(e.target.value))}
                      className="pl-7"
                    />
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Max Price</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      value={formatCurrency(priceRangeMax)}
                      onChange={(e) => setPriceRangeMax(parseCurrency(e.target.value))}
                      className="pl-7"
                    />
                  </div>
                </Field>
              </>
            )}
          </FieldGroup>
        </SectionCard>

        {/* ── Step 2: Asset Specs (Tier 2 — UniqueCriteria) ────────── */}
        <SectionCard
          icon={Layers}
          title={`Asset Specs \u2014 ${subtypeLabel}`}
          open={openSections.assetSpecs}
          onOpenChange={() => toggleSection('assetSpecs')}
          disabled={step < 1}
        >
          {/* Residential Income group: BFR, SFR, MF */}
          {(assetSubType === 'build_for_rent' || assetSubType === 'sfr_portfolio' || assetSubType === 'multifamily') && (
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Product Type</FieldLabel>
                <Select items={BFR_PRODUCT_TYPES} value={productType} onValueChange={setProductType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {BFR_PRODUCT_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Unit Count</FieldLabel>
                <Input
                  type="number"
                  value={unitCount}
                  onChange={(e) => setUnitCount(e.target.value ? Number(e.target.value) : '')}
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
          {assetSubType === 'land' && (
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
                <FieldLabel>Target Unit Count</FieldLabel>
                <Input
                  type="number"
                  value={unitCount}
                  onChange={(e) => setUnitCount(e.target.value ? Number(e.target.value) : '')}
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

        {/* ── Step 3: Asset Details (Tier 3 — soft refinement) ──────── */}
        <SectionCard
          icon={Scale}
          title="Asset Details"
          open={openSections.saleTerms}
          onOpenChange={() => toggleSection('saleTerms')}
          disabled={step < 2}
        >
          {/* BFR Tier 3 */}
          {assetSubType === 'build_for_rent' && (
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Lease-Up Status</FieldLabel>
                <Select items={LEASE_UP_RISK_OPTIONS} value={leaseUpRisk} onValueChange={setLeaseUpRisk}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
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
                <FieldLabel>Phase Sale Allowed</FieldLabel>
                <Select items={PHASE_SALE_PREF_OPTIONS} value={phaseSalePref} onValueChange={setPhaseSalePref}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PHASE_SALE_PREF_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Target Price Per Unit (Min)</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    value={formatCurrency(targetPpuMin)}
                    onChange={(e) => setTargetPpuMin(parseCurrency(e.target.value))}
                    className="pl-7"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel>Target Price Per Unit (Max)</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    value={formatCurrency(targetPpuMax)}
                    onChange={(e) => setTargetPpuMax(parseCurrency(e.target.value))}
                    className="pl-7"
                  />
                </div>
              </Field>
              <Field className="col-span-2">
                <FieldLabel>Amenity Package</FieldLabel>
                <MultiSelect
                  options={AMENITY_OPTIONS}
                  selected={amenityRequirements}
                  onChange={setAmenityRequirements}
                  placeholder="Select amenities..."
                />
              </Field>
            </FieldGroup>
          )}

          {/* SFR Tier 3 */}
          {assetSubType === 'sfr_portfolio' && (
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>HOA Status</FieldLabel>
                <Select items={HOA_STATUS_OPTIONS} value={hoaStatus} onValueChange={setHoaStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {HOA_STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Sewer Type</FieldLabel>
                <Select items={SEWER_TYPE_OPTIONS} value={sewerType} onValueChange={setSewerType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SEWER_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Section 8 Policy</FieldLabel>
                <Select items={SECTION_8_POLICY_OPTIONS} value={section8Policy} onValueChange={setSection8Policy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SECTION_8_POLICY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Year Built</FieldLabel>
                <Input
                  type="number"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Bedrooms</FieldLabel>
                <Input
                  type="number"
                  value={bedCount}
                  onChange={(e) => setBedCount(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Bathrooms</FieldLabel>
                <Input
                  type="number"
                  value={bathCount}
                  onChange={(e) => setBathCount(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Property Condition</FieldLabel>
                <Select items={SFR_CONDITION_OPTIONS} value={propertyCondition} onValueChange={setPropertyCondition}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SFR_CONDITION_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          )}

          {/* MF Tier 3 */}
          {assetSubType === 'multifamily' && (
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Year Built</FieldLabel>
                <Input
                  type="number"
                  value={mfYearBuilt}
                  onChange={(e) => setMfYearBuilt(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Deferred Maintenance</FieldLabel>
                <Select items={MF_DEFERRED_MAINTENANCE_OPTIONS} value={deferredMaintenance} onValueChange={setDeferredMaintenance}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {MF_DEFERRED_MAINTENANCE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          )}

          {/* Land Tier 3 */}
          {assetSubType === 'land' && (
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Target Basis</FieldLabel>
                <Select items={TARGET_BASIS_OPTIONS} value={targetBasis} onValueChange={setTargetBasis}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select basis" />
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
                <FieldLabel>Projected Density</FieldLabel>
                <Input
                  type="number"
                  placeholder="Units per buildable acre"
                  value={projectedDensity}
                  onChange={(e) => setProjectedDensity(e.target.value ? Number(e.target.value) : '')}
                />
              </Field>
              <Field>
                <FieldLabel>Entitlement Status</FieldLabel>
                <Select items={ENTITLEMENT_DEPTH_OPTIONS} value={entitlementDepth} onValueChange={setEntitlementDepth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
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
                <FieldLabel>Development Depth</FieldLabel>
                <Select items={DEVELOPMENT_DEPTH_OPTIONS} value={developmentDepth} onValueChange={setDevelopmentDepth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select depth" />
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
                <FieldLabel>Phased Takedown Allowed</FieldLabel>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={phasedTakedownAllowed}
                  onValueChange={(val) => { if (val) setPhasedTakedownAllowed(val) }}
                  className="w-full"
                >
                  <ToggleGroupItem value="yes" className="flex-1">Yes</ToggleGroupItem>
                  <ToggleGroupItem value="no" className="flex-1">No</ToggleGroupItem>
                </ToggleGroup>
              </Field>
            </FieldGroup>
          )}
        </SectionCard>

        {/* ── Step 4: Documents ─────────────────────────────────────── */}
        <input
          ref={wizardFileInputRef}
          type="file"
          className="hidden"
          onChange={handleWizardFileSelected}
        />
        <SectionCard
          icon={FileText}
          title="Documents"
          open={openSections.documents}
          onOpenChange={() => toggleSection('documents')}
          disabled={step < 2}
        >
          <DocumentListGroup>
            {documents.length > 0 ? (
              documents.map((doc) => (
                <DocumentListItem
                  key={doc.name}
                  variant={doc.status === 'uploaded' ? 'uploaded' : 'pending'}
                  icon={doc.status === 'uploaded' ? CheckCircle2 : FileText}
                  title={doc.name}
                  description={doc.status === 'uploaded' && 'fileName' in doc ? (doc as { fileName?: string }).fileName : undefined}
                  primaryAction={
                    doc.status === 'uploaded'
                      ? { label: 'Replace', icon: RefreshCw, onClick: () => openWizardFilePicker(doc.name) }
                      : { label: 'Upload', icon: Upload, onClick: () => openWizardFilePicker(doc.name) }
                  }
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No documents yet.</p>
            )}
          </DocumentListGroup>
        </SectionCard>

        {/* ── Step 5: Review & Submit ──────────────────────────────── */}
        <SectionCard
          icon={ClipboardCheck}
          title="Review & Submit"
          open={openSections.review}
          onOpenChange={() => toggleSection('review')}
          disabled={step < 2}
        >
          <div className="flex flex-col gap-4">
            {/* Deal Overview */}
            <ReviewRow label="Property" value={propertyName} />
            <ReviewRow label="Asset Type" value={enumLabel(ASSET_CLASS_OPTIONS, assetClass)} />
            <ReviewRow label="Asset Sub-Type" value={subtypeLabel} />
            <ReviewRow label="Geography (MSA)" value={locationMsa} />
            <ReviewRow label="Current Development Status" value={enumLabel(DEVELOPMENT_STATUS_OPTIONS, currentDevelopmentStatus)} />
            <ReviewRow label="Pricing Posture" value={enumLabel(PRICING_POSTURE_OPTIONS, pricingPosture)} />
            {pricingPosture === 'exact_price' && (
              <ReviewRow label="Asking Price" value={`$${formatCurrency(exactPrice)}`} />
            )}
            {pricingPosture === 'price_range' && (
              <ReviewRow label="Price Range" value={`$${formatCurrency(priceRangeMin)} \u2013 $${formatCurrency(priceRangeMax)}`} />
            )}
            <Separator />
            {/* Asset Specs — Residential Income */}
            {(assetSubType === 'build_for_rent' || assetSubType === 'sfr_portfolio' || assetSubType === 'multifamily') && (
              <>
                <ReviewRow label="Product Type" value={enumLabel(BFR_PRODUCT_TYPES, productType)} />
                <ReviewRow label="Unit Count" value={String(unitCount)} />
                <ReviewRow label="Square Footage Range" value={`${sqftMin} – ${sqftMax}`} />
                <ReviewRow label="Garage Preference" value={enumLabel(GARAGE_PREFERENCE_OPTIONS, garagePreference)} />
              </>
            )}
            {/* Asset Specs — Land */}
            {assetSubType === 'land' && (
              <>
                <ReviewRow label="Land Product Type" value={enumLabel(LAND_PRODUCT_TYPE_OPTIONS, landProductType)} />
                <ReviewRow label="Target Unit Count" value={String(unitCount)} />
                <ReviewRow label="Pricing Basis" value={enumLabel(PRICING_BASIS_OPTIONS, pricingBasis)} />
              </>
            )}
            <Separator />
            {/* Asset Details — BFR */}
            <ReviewRow label="Deal Room Stage" value={`${stageNumber} \u2014 ${STAGE_LABELS[stageNumber] ?? ''}`} />
            {assetSubType === 'build_for_rent' && (
              <>
                <ReviewRow label="Lease-Up Status" value={enumLabel(LEASE_UP_RISK_OPTIONS, leaseUpRisk)} />
                <ReviewRow label="Target Price Per Unit" value={`$${formatCurrency(targetPpuMin)} \u2013 $${formatCurrency(targetPpuMax)}`} />
                <ReviewRow label="Amenity Package" value={amenityRequirements.map((v) => enumLabel(AMENITY_OPTIONS, v)).join(', ') || 'None'} />
                <ReviewRow label="Phase Sale Allowed" value={enumLabel(PHASE_SALE_PREF_OPTIONS, phaseSalePref)} />
              </>
            )}
            {/* Asset Details — SFR */}
            {assetSubType === 'sfr_portfolio' && (
              <>
                <ReviewRow label="HOA Status" value={enumLabel(HOA_STATUS_OPTIONS, hoaStatus)} />
                <ReviewRow label="Sewer Type" value={enumLabel(SEWER_TYPE_OPTIONS, sewerType)} />
                <ReviewRow label="Section 8 Policy" value={enumLabel(SECTION_8_POLICY_OPTIONS, section8Policy)} />
                <ReviewRow label="Year Built" value={String(yearBuilt)} />
                <ReviewRow label="Bedrooms" value={String(bedCount)} />
                <ReviewRow label="Bathrooms" value={String(bathCount)} />
                <ReviewRow label="Property Condition" value={enumLabel(SFR_CONDITION_OPTIONS, propertyCondition)} />
              </>
            )}
            {/* Asset Details — MF */}
            {assetSubType === 'multifamily' && (
              <>
                <ReviewRow label="Year Built" value={String(mfYearBuilt)} />
                <ReviewRow label="Deferred Maintenance" value={enumLabel(MF_DEFERRED_MAINTENANCE_OPTIONS, deferredMaintenance)} />
              </>
            )}
            {/* Asset Details — Land */}
            {assetSubType === 'land' && (
              <>
                <ReviewRow label="Target Basis" value={enumLabel(TARGET_BASIS_OPTIONS, targetBasis)} />
                <ReviewRow label="Projected Density" value={projectedDensity ? `${projectedDensity} units/acre` : ''} />
                <ReviewRow label="Entitlement Status" value={enumLabel(ENTITLEMENT_DEPTH_OPTIONS, entitlementDepth)} />
                <ReviewRow label="Development Depth" value={enumLabel(DEVELOPMENT_DEPTH_OPTIONS, developmentDepth)} />
                <ReviewRow label="Phased Takedown Allowed" value={phasedTakedownAllowed === 'yes' ? 'Yes' : phasedTakedownAllowed === 'no' ? 'No' : ''} />
              </>
            )}
            <Separator />
            {/* Documents */}
            <ReviewRow
              label="Documents"
              value={documents.length > 0 ? documents.map((d) => d.name).join(', ') : 'None'}
            />
            <div className="flex justify-end gap-3 pt-2">
              {onSaveAsDraft && (
                <Button
                  variant="outline"
                  onClick={() => onSaveAsDraft(getFormSnapshot(), step)}
                >
                  <FileText data-icon="inline-start" />
                  Save as Draft
                </Button>
              )}
              <Button
                onClick={onSubmit}
                className="bg-mode-sell hover:bg-mode-sell/80 text-white px-6"
              >
                <CheckCircle2 data-icon="inline-start" />
                Submit for Review
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
