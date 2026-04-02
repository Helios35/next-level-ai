import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  PlusCircle,
  Building2,
  Layers,
  Scale,
  FileText,
  ClipboardCheck,
  Upload,
  CheckCircle2,
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

// ── Shared styles ───────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50 transition-colors'

// ── Animation variants ──────────────────────────────────────────────────────

const sectionVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

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
}

export default function CreateListingWizard({ step, onSubmit, onSaveAsDraft, initialState }: CreateListingWizardProps) {
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
  const [documents, setDocuments] = useState<{ name: string; status: string }[]>(initialState?.documents ?? [])

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
    if (step >= 4 && documents.length === 0) {
      setDocuments([
        { name: 'Purchase & Sale Agreement', status: 'pending' },
        { name: 'Survey / Site Plan', status: 'pending' },
        { name: 'Pro Forma', status: 'pending' },
      ])
    }
  }, [step, documents.length])

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
      <div className="mx-auto w-full max-w-3xl px-6 py-6 space-y-6">
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
              <FileText size={16} />
              Save as Draft
            </Button>
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────── */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3"
          >
            <PlusCircle size={48} strokeWidth={1} className="opacity-30" />
            <p className="text-sm">Tell the AI about your property to get started.</p>
          </motion.div>
        )}

        {/* ── Step 1: Deal Overview (Tier 1 — Shared Criteria) ─────── */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div key="deal-overview" variants={sectionVariants} initial="initial" animate="animate" exit="exit">
              <SectionCard icon={Building2} title="Deal Overview">
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="Property Name" span={2}>
                    <input
                      type="text"
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      className={inputClass}
                    />
                  </FieldGroup>
                  <FieldGroup label="Asset Class">
                    <select
                      value={assetClass}
                      onChange={(e) => handleAssetClassChange(e.target.value)}
                      className={inputClass}
                    >
                      {ASSET_CLASS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Asset Type">
                    <select
                      value={assetSubType}
                      onChange={(e) => setAssetSubType(e.target.value)}
                      disabled={isLand}
                      className={cn(inputClass, isLand && 'opacity-60')}
                    >
                      {subtypeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Geography (MSA)">
                    <input
                      type="text"
                      value={locationMsa}
                      onChange={(e) => setLocationMsa(e.target.value)}
                      className={inputClass}
                    />
                  </FieldGroup>
                  <FieldGroup label="Deal Stage">
                    <select
                      value={dealStage}
                      onChange={(e) => setDealStage(e.target.value)}
                      className={inputClass}
                    >
                      {DEAL_STAGE_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Pricing Posture">
                    <div className="flex rounded-lg border border-border overflow-hidden">
                      {PRICING_POSTURE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setPricingPosture(opt.value)}
                          className={cn(
                            'flex-1 px-3 py-2 text-xs font-medium transition-colors',
                            pricingPosture === opt.value
                              ? 'bg-mode-sell text-white'
                              : 'bg-background text-muted-foreground hover:bg-muted',
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </FieldGroup>
                  {pricingPosture === 'exact_price' && (
                    <FieldGroup label="Asking Price">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                        <input
                          type="text"
                          value={formatCurrency(exactPrice)}
                          onChange={(e) => setExactPrice(parseCurrency(e.target.value))}
                          className={cn(inputClass, 'pl-7')}
                        />
                      </div>
                    </FieldGroup>
                  )}
                  {pricingPosture === 'price_range' && (
                    <>
                      <FieldGroup label="Min Price">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                          <input
                            type="text"
                            value={formatCurrency(priceRangeMin)}
                            onChange={(e) => setPriceRangeMin(parseCurrency(e.target.value))}
                            className={cn(inputClass, 'pl-7')}
                          />
                        </div>
                      </FieldGroup>
                      <FieldGroup label="Max Price">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                          <input
                            type="text"
                            value={formatCurrency(priceRangeMax)}
                            onChange={(e) => setPriceRangeMax(parseCurrency(e.target.value))}
                            className={cn(inputClass, 'pl-7')}
                          />
                        </div>
                      </FieldGroup>
                    </>
                  )}
                </div>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step 2: Asset Specs (Tier 2 — UniqueCriteria) ────────── */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div key="asset-specs" variants={sectionVariants} initial="initial" animate="animate" exit="exit">
              <SectionCard icon={Layers} title={`Asset Specs \u2014 ${subtypeLabel}`}>
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="Product Type">
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className={inputClass}
                    >
                      {BFR_PRODUCT_TYPES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Development Status">
                    <select
                      value={currentDevelopmentStatus}
                      onChange={(e) => setCurrentDevelopmentStatus(e.target.value)}
                      className={inputClass}
                    >
                      {(() => {
                        const groups = [...new Set(DEVELOPMENT_STATUS_OPTIONS.map((o) => o.group))]
                        return groups.map((g) => (
                          <optgroup key={g} label={g}>
                            {DEVELOPMENT_STATUS_OPTIONS.filter((o) => o.group === g).map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </optgroup>
                        ))
                      })()}
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Sale Stage Status">
                    <select
                      value={saleStageStatus}
                      onChange={(e) => setSaleStageStatus(e.target.value)}
                      className={inputClass}
                    >
                      {DEAL_STAGE_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Sale Window">
                    <select
                      value={saleWindow}
                      onChange={(e) => setSaleWindow(e.target.value)}
                      className={inputClass}
                    >
                      {SALE_WINDOW_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Unit Count">
                    <input
                      type="number"
                      value={unitCount}
                      onChange={(e) => setUnitCount(e.target.value ? Number(e.target.value) : '')}
                      className={inputClass}
                    />
                  </FieldGroup>
                  <div /> {/* empty cell for grid alignment */}
                  <FieldGroup label="Phase Sale Allowed">
                    <BooleanToggle value={phaseSaleAllowed} onChange={setPhaseSaleAllowed} />
                  </FieldGroup>
                  <FieldGroup label="Must Sell as Package">
                    <BooleanToggle value={mustSellAsPackage} onChange={setMustSellAsPackage} />
                  </FieldGroup>
                </div>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step 3: Sale Terms ───────────────────────────────────── */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div key="sale-terms" variants={sectionVariants} initial="initial" animate="animate" exit="exit">
              <SectionCard icon={Scale} title="Sale Terms">
                <div className="space-y-4">
                  <FieldGroup label={`Deal Room Stage: ${stageNumber} \u2014 ${STAGE_LABELS[stageNumber] ?? ''}`}>
                    <Slider
                      value={[stageNumber]}
                      onValueChange={(val: number[]) => setStageNumber(val[0])}
                      min={1}
                      max={9}
                      step={1}
                    />
                  </FieldGroup>
                </div>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step 4: Documents ─────────────────────────────────────── */}
        <AnimatePresence>
          {step >= 4 && (
            <motion.div key="documents" variants={sectionVariants} initial="initial" animate="animate" exit="exit">
              <SectionCard icon={FileText} title="Documents">
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-muted-foreground" />
                        <span className="text-sm font-medium">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-amber-500/30 text-amber-500 capitalize">
                          {doc.status}
                        </Badge>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <Upload size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step 5: Review & Submit ──────────────────────────────── */}
        <AnimatePresence>
          {step >= 4 && (
            <motion.div key="review" variants={sectionVariants} initial="initial" animate="animate" exit="exit">
              <SectionCard icon={ClipboardCheck} title="Review & Submit">
                <div className="space-y-4">
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
                  <div className="border-t border-border" />
                  {/* Asset Specs */}
                  <ReviewRow label="Product Type" value={enumLabel(BFR_PRODUCT_TYPES, productType)} />
                  <ReviewRow label="Development Status" value={enumLabel(DEVELOPMENT_STATUS_OPTIONS, currentDevelopmentStatus)} />
                  <ReviewRow label="Sale Stage Status" value={enumLabel(DEAL_STAGE_OPTIONS, saleStageStatus)} />
                  <ReviewRow label="Sale Window" value={enumLabel(SALE_WINDOW_OPTIONS, saleWindow)} />
                  <ReviewRow label="Unit Count" value={String(unitCount)} />
                  <ReviewRow label="Phase Sale Allowed" value={phaseSaleAllowed ? 'Yes' : 'No'} />
                  <ReviewRow label="Must Sell as Package" value={mustSellAsPackage ? 'Yes' : 'No'} />
                  <div className="border-t border-border" />
                  {/* Sale Terms */}
                  <ReviewRow label="Deal Room Stage" value={`${stageNumber} \u2014 ${STAGE_LABELS[stageNumber] ?? ''}`} />
                  <div className="border-t border-border" />
                  {/* Documents */}
                  <ReviewRow
                    label="Documents"
                    value={documents.map((d) => d.name).join(', ')}
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    {onSaveAsDraft && (
                      <Button
                        variant="outline"
                        onClick={() => onSaveAsDraft(getFormSnapshot(), step)}
                      >
                        <FileText size={16} />
                        Save as Draft
                      </Button>
                    )}
                    <Button
                      onClick={onSubmit}
                      className="bg-mode-sell hover:bg-mode-sell/80 text-white px-6"
                    >
                      <CheckCircle2 size={16} />
                      Submit for Review
                    </Button>
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Building2
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Icon size={16} className="text-mode-sell" />
        {title}
      </h3>
      {children}
    </div>
  )
}

function FieldGroup({
  label,
  span,
  children,
}: {
  label: string
  span?: number
  children: React.ReactNode
}) {
  return (
    <label className={cn('flex flex-col gap-1.5', span === 2 && 'col-span-2')}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-medium text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  )
}

function BooleanToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => onChange(true)}
        className={cn(
          'flex-1 px-4 py-2 text-sm font-medium transition-colors',
          value ? 'bg-mode-sell text-white' : 'bg-background text-muted-foreground hover:bg-muted',
        )}
      >
        Yes
      </button>
      <button
        onClick={() => onChange(false)}
        className={cn(
          'flex-1 px-4 py-2 text-sm font-medium transition-colors',
          !value ? 'bg-mode-sell text-white' : 'bg-background text-muted-foreground hover:bg-muted',
        )}
      >
        No
      </button>
    </div>
  )
}
