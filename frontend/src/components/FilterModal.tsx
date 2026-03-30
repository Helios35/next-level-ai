import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { MultiSelect } from '@/components/ui/multi-select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

export interface FilterState {
  location: string[]
  status: string[]
  assetType: string[]
  priceRange: [number, number] | null
  dealStage: string[]
  stage: number[]
}

export const EMPTY_FILTERS: FilterState = {
  location: [],
  status: [],
  assetType: [],
  priceRange: null,
  dealStage: [],
  stage: [],
}

export function isFiltersEmpty(filters: FilterState): boolean {
  return (
    filters.location.length === 0 &&
    filters.status.length === 0 &&
    filters.assetType.length === 0 &&
    filters.priceRange === null &&
    filters.dealStage.length === 0 &&
    filters.stage.length === 0
  )
}

interface FilterSection {
  key: keyof FilterState
  label: string
  options: { value: string | number; label: string }[]
}

const FILTER_SECTIONS: FilterSection[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'market_tested', label: 'Tested' },
      { value: 'dormant', label: 'Dormant' },
      { value: 'closed', label: 'Closed' },
      { value: 'withdrawn', label: 'Withdrawn' },
    ],
  },
  {
    key: 'assetType',
    label: 'Asset Type',
    options: [
      { value: 'build_for_rent', label: 'BFR' },
      { value: 'sfr_portfolio', label: 'SFR Portfolio' },
      { value: 'multifamily', label: 'Multifamily' },
      { value: 'land', label: 'Land' },
    ],
  },
  {
    key: 'dealStage',
    label: 'Deal Stage',
    options: [
      { value: 'pre_development', label: 'Pre-Development' },
      { value: 'in_development', label: 'In Development' },
      { value: 'delivered_vacant', label: 'Delivered Vacant' },
      { value: 'lease_up', label: 'Lease-Up' },
      { value: 'stabilized', label: 'Stabilized' },
    ],
  },
]

/* ── FilterModal ────────────────────────────────────────────── */

interface PriceRangeConfig {
  min: number
  max: number
  step: number
  formatLabel: (value: number) => string
}

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onApply: (filters: FilterState) => void
  onClear: () => void
  locationOptions?: { value: string; label: string }[]
  stageOptions?: { value: string; label: string }[]
  priceRangeConfig?: PriceRangeConfig
}

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onClear,
  locationOptions,
  stageOptions,
  priceRangeConfig,
}: FilterModalProps) {
  const [draft, setDraft] = useState<FilterState>(filters)

  useEffect(() => {
    if (isOpen) setDraft(filters)
  }, [isOpen, filters])

  function toggleValue(section: keyof FilterState, value: string | number) {
    setDraft((prev) => {
      const current = prev[section] as (string | number)[]
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [section]: next }
    })
  }

  function handleApply() {
    onApply(draft)
  }

  function handleClear() {
    onClear()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Filter your listings by location, stage, status, asset type, price range, and deal stage
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-6">
          {/* Location multi-select */}
          {locationOptions && locationOptions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Location
              </h3>
              <MultiSelect
                options={locationOptions}
                selected={draft.location}
                onChange={(next) => setDraft((prev) => ({ ...prev, location: next }))}
                placeholder="Search locations..."
              />
            </div>
          )}

          {/* Stage multi-select */}
          {stageOptions && stageOptions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Stage
              </h3>
              <MultiSelect
                options={stageOptions}
                selected={draft.stage.map(String)}
                onChange={(next) =>
                  setDraft((prev) => ({ ...prev, stage: next.map(Number) }))
                }
                placeholder="Search stages..."
              />
            </div>
          )}

          {/* Status + Asset Type */}
          {FILTER_SECTIONS.slice(0, 2).map((section) => (
            <div key={section.key}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.label}
              </h3>
              <div className="space-y-2.5">
                {section.options.map((opt) => {
                  const checked = (
                    draft[section.key] as (string | number)[]
                  ).includes(opt.value)
                  return (
                    <label
                      key={String(opt.value)}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() =>
                          toggleValue(section.key, opt.value)
                        }
                      />
                      <span className="text-sm text-foreground group-hover:text-foreground/80">
                        {opt.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Price Range slider */}
          {priceRangeConfig && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Price Range
              </h3>
              <Slider
                min={priceRangeConfig.min}
                max={priceRangeConfig.max}
                step={priceRangeConfig.step}
                value={draft.priceRange ?? [priceRangeConfig.min, priceRangeConfig.max]}
                onValueChange={(val) =>
                  setDraft((prev) => ({
                    ...prev,
                    priceRange: val as unknown as [number, number],
                  }))
                }
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>
                  {priceRangeConfig.formatLabel(
                    draft.priceRange?.[0] ?? priceRangeConfig.min,
                  )}
                </span>
                <span>
                  {priceRangeConfig.formatLabel(
                    draft.priceRange?.[1] ?? priceRangeConfig.max,
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Deal Stage */}
          {FILTER_SECTIONS.slice(2).map((section) => (
            <div key={section.key}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.label}
              </h3>
              <div className="space-y-2.5">
                {section.options.map((opt) => {
                  const checked = (
                    draft[section.key] as (string | number)[]
                  ).includes(opt.value)
                  return (
                    <label
                      key={String(opt.value)}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() =>
                          toggleValue(section.key, opt.value)
                        }
                      />
                      <span className="text-sm text-foreground group-hover:text-foreground/80">
                        {opt.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="flex-row gap-2 border-t border-border pt-4">
          <Button variant="ghost" className="flex-1" onClick={handleClear}>
            Clear All
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
