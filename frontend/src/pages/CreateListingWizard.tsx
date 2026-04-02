import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
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
  SelectLabel,
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

const WIZARD_STEPS = ['Deal Overview', 'Asset Specs', 'Sale Terms', 'Documents', 'Review']

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

// ── Section keys ────────────────────────────────────────────────────────────

type SectionKey = 'dealOverview' | 'assetSpecs' | 'saleTerms' | 'documents' | 'review'

// ── Exported types for draft state ──────────────────────────────────────────

export interface WizardFormState {
  propertyName: string
  assetClass: string
  assetSubType: string
  locationMsa: string
  dealStage: string
  pricingPosture: string
  exactPrice: number | ''
  priceRangeMin: number | ''
  priceRangeMax: number | ''
  productType: string
  currentDevelopmentStatus: string
  saleStageStatus: string
  saleWindow: string
  unitCount: number | ''
  phaseSaleAllowed: boolean
  mustSellAsPackage: boolean
  stageNumber: number
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
  const [dealStage, setDealStage] = useState(initialState?.dealStage ?? '')
  const [pricingPosture, setPricingPosture] = useState(initialState?.pricingPosture ?? '')
  const [exactPrice, setExactPrice] = useState<number | ''>(initialState?.exactPrice ?? '')
  const [priceRangeMin, setPriceRangeMin] = useState<number | ''>(initialState?.priceRangeMin ?? '')
  const [priceRangeMax, setPriceRangeMax] = useState<number | ''>(initialState?.priceRangeMax ?? '')

  // ── Step 2: Asset Specs (Tier 2 — UniqueCriteria, BFR demo) ────────────
  const [productType, setProductType] = useState(initialState?.productType ?? '')
  const [currentDevelopmentStatus, setCurrentDevelopmentStatus] = useState(initialState?.currentDevelopmentStatus ?? '')
  const [saleStageStatus, setSaleStageStatus] = useState(initialState?.saleStageStatus ?? '')
  const [saleWindow, setSaleWindow] = useState(initialState?.saleWindow ?? '')
  const [unitCount, setUnitCount] = useState<number | ''>(initialState?.unitCount ?? '')
  const [phaseSaleAllowed, setPhaseSaleAllowed] = useState(initialState?.phaseSaleAllowed ?? false)
  const [mustSellAsPackage, setMustSellAsPackage] = useState(initialState?.mustSellAsPackage ?? false)

  // ── Step 3: Sale Terms ──────────────────────────────────────────────────
  const [stageNumber, setStageNumber] = useState(initialState?.stageNumber ?? 1)

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
      setDealStage('in_development')
      setPricingPosture('exact_price')
      setExactPrice(8_400_000)
    }
  }, [step, propertyName])

  useEffect(() => {
    if (step >= 2 && !productType) {
      setProductType('detached')
      setCurrentDevelopmentStatus('vertical_under_construction')
      setSaleStageStatus('in_development')
      setSaleWindow('6_12_months')
      setUnitCount(42)
      setPhaseSaleAllowed(false)
      setMustSellAsPackage(true)
    }
  }, [step, productType])

  useEffect(() => {
    if (step >= 3 && stageNumber === 1) {
      setStageNumber(4)
    }
  }, [step, stageNumber])

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
    propertyName, assetClass, assetSubType, locationMsa, dealStage,
    pricingPosture, exactPrice, priceRangeMin, priceRangeMax,
    productType, currentDevelopmentStatus, saleStageStatus, saleWindow,
    unitCount, phaseSaleAllowed, mustSellAsPackage,
    stageNumber, documents,
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
              <FieldLabel>Asset Class</FieldLabel>
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
              <FieldLabel>Asset Type</FieldLabel>
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
              <FieldLabel>Deal Stage</FieldLabel>
              <Select items={DEAL_STAGE_OPTIONS} value={dealStage} onValueChange={setDealStage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {DEAL_STAGE_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
              <FieldLabel>Development Status</FieldLabel>
              <Select items={DEVELOPMENT_STATUS_OPTIONS} value={currentDevelopmentStatus} onValueChange={setCurrentDevelopmentStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const groups = [...new Set(DEVELOPMENT_STATUS_OPTIONS.map((o) => o.group))]
                    return groups.map((g) => (
                      <SelectGroup key={g}>
                        <SelectLabel>{g}</SelectLabel>
                        {DEVELOPMENT_STATUS_OPTIONS.filter((o) => o.group === g).map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))
                  })()}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Sale Stage Status</FieldLabel>
              <Select items={DEAL_STAGE_OPTIONS} value={saleStageStatus} onValueChange={setSaleStageStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {DEAL_STAGE_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Sale Window</FieldLabel>
              <Select items={SALE_WINDOW_OPTIONS} value={saleWindow} onValueChange={setSaleWindow}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SALE_WINDOW_OPTIONS.map((o) => (
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
            <div /> {/* empty cell for grid alignment */}
            <Field>
              <FieldLabel>Phase Sale Allowed</FieldLabel>
              <ToggleGroup
                type="single"
                variant="outline"
                value={phaseSaleAllowed ? 'yes' : 'no'}
                onValueChange={(val) => { if (val) setPhaseSaleAllowed(val === 'yes') }}
                className="w-full"
              >
                <ToggleGroupItem value="yes" className="flex-1">Yes</ToggleGroupItem>
                <ToggleGroupItem value="no" className="flex-1">No</ToggleGroupItem>
              </ToggleGroup>
            </Field>
            <Field>
              <FieldLabel>Must Sell as Package</FieldLabel>
              <ToggleGroup
                type="single"
                variant="outline"
                value={mustSellAsPackage ? 'yes' : 'no'}
                onValueChange={(val) => { if (val) setMustSellAsPackage(val === 'yes') }}
                className="w-full"
              >
                <ToggleGroupItem value="yes" className="flex-1">Yes</ToggleGroupItem>
                <ToggleGroupItem value="no" className="flex-1">No</ToggleGroupItem>
              </ToggleGroup>
            </Field>
          </FieldGroup>
        </SectionCard>

        {/* ── Step 3: Sale Terms (soft gate — no blocking) ─────────── */}
        <SectionCard
          icon={Scale}
          title="Sale Terms"
          open={openSections.saleTerms}
          onOpenChange={() => toggleSection('saleTerms')}
          disabled={step < 2}
        >
          <Field>
            <FieldLabel>{`Deal Room Stage: ${stageNumber} \u2014 ${STAGE_LABELS[stageNumber] ?? ''}`}</FieldLabel>
            <Slider
              value={[stageNumber]}
              onValueChange={(val: number[]) => setStageNumber(val[0])}
              min={1}
              max={9}
              step={1}
            />
          </Field>
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
            <ReviewRow label="Asset Class" value={enumLabel(ASSET_CLASS_OPTIONS, assetClass)} />
            <ReviewRow label="Asset Type" value={subtypeLabel} />
            <ReviewRow label="Geography (MSA)" value={locationMsa} />
            <ReviewRow label="Deal Stage" value={enumLabel(DEAL_STAGE_OPTIONS, dealStage)} />
            <ReviewRow label="Pricing Posture" value={enumLabel(PRICING_POSTURE_OPTIONS, pricingPosture)} />
            {pricingPosture === 'exact_price' && (
              <ReviewRow label="Asking Price" value={`$${formatCurrency(exactPrice)}`} />
            )}
            {pricingPosture === 'price_range' && (
              <ReviewRow label="Price Range" value={`$${formatCurrency(priceRangeMin)} \u2013 $${formatCurrency(priceRangeMax)}`} />
            )}
            <Separator />
            {/* Asset Specs */}
            <ReviewRow label="Product Type" value={enumLabel(BFR_PRODUCT_TYPES, productType)} />
            <ReviewRow label="Development Status" value={enumLabel(DEVELOPMENT_STATUS_OPTIONS, currentDevelopmentStatus)} />
            <ReviewRow label="Sale Stage Status" value={enumLabel(DEAL_STAGE_OPTIONS, saleStageStatus)} />
            <ReviewRow label="Sale Window" value={enumLabel(SALE_WINDOW_OPTIONS, saleWindow)} />
            <ReviewRow label="Unit Count" value={String(unitCount)} />
            <ReviewRow label="Phase Sale Allowed" value={phaseSaleAllowed ? 'Yes' : 'No'} />
            <ReviewRow label="Must Sell as Package" value={mustSellAsPackage ? 'Yes' : 'No'} />
            <Separator />
            {/* Sale Terms */}
            <ReviewRow label="Deal Room Stage" value={`${stageNumber} \u2014 ${STAGE_LABELS[stageNumber] ?? ''}`} />
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
