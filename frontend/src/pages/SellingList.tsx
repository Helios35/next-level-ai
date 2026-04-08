import { useRef, useState } from 'react'
import { Home, Search, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { DealRoom } from '@shared/types/dealRoom'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { MOCK_SELLER_PERFORMANCE } from '@/data/mock/users'
import DealCard from '@/components/DealCard'
import DealCardList from '@/components/DealCardList'
import DealPreviewModal from '@/components/DealPreviewModal'
import SellerListingsEmpty from '@/components/SellerListingsEmpty'
import { StatTile, StatTileGrid } from '@/components/ui/stat-tile'
import FilterModal, {
  type FilterState,
  EMPTY_FILTERS,
  isFiltersEmpty,
} from '@/components/FilterModal'

const LOCATION_OPTIONS = [
  { value: 'Charlotte-Concord-Gastonia, NC-SC', label: 'Charlotte-Concord-Gastonia, NC-SC' },
  { value: 'Raleigh-Cary, NC', label: 'Raleigh-Cary, NC' },
  { value: 'Nashville-Davidson-Murfreesboro-Franklin, TN', label: 'Nashville, TN' },
  { value: 'Austin-Round Rock-Georgetown, TX', label: 'Austin, TX' },
]

const LOCATION_LABEL_MAP = Object.fromEntries(
  LOCATION_OPTIONS.map((o) => [o.value, o.label]),
)

const PRICE_RANGE_CONFIG = {
  min: 4_000_000,
  max: 25_000_000,
  step: 500_000,
  formatLabel: (v: number) => `$${(v / 1_000_000).toFixed(1)}M`,
}

const STAGE_OPTIONS = Array.from({ length: 9 }, (_, i) => ({
  value: String(i + 1),
  label: `Stage ${i + 1}`,
}))

const FILTER_LABEL_MAP: Record<string, string> = {
  active: 'Active',
  market_tested: 'Market Tested',
  dormant: 'Dormant',
  closed: 'Closed',
  withdrawn: 'Withdrawn',
  build_for_rent: 'BFR',
  sfr_portfolio: 'SFR Portfolio',
  multifamily: 'Multifamily',
  land: 'Land',
  pre_development: 'Pre-Development',
  in_development: 'In Development',
  delivered_vacant: 'Delivered Vacant',
  lease_up: 'Lease-Up',
  stabilized: 'Stabilized',
  ...LOCATION_LABEL_MAP,
}

function getChipLabel(value: string | number): string {
  if (typeof value === 'number') return `Stage ${value}`
  return FILTER_LABEL_MAP[value] ?? value
}

function getActiveChips(filters: FilterState): { key: keyof FilterState; value: string | number; label: string }[] {
  const chips: { key: keyof FilterState; value: string | number; label: string }[] = []
  for (const key of ['location', 'status', 'assetType', 'dealStage', 'stage'] as const) {
    for (const value of filters[key]) {
      chips.push({ key, value, label: getChipLabel(value) })
    }
  }
  if (filters.priceRange) {
    const fmt = PRICE_RANGE_CONFIG.formatLabel
    chips.push({
      key: 'priceRange',
      value: 'range',
      label: `${fmt(filters.priceRange[0])} – ${fmt(filters.priceRange[1])}`,
    })
  }
  return chips
}

function matchesFilters(deal: DealRoom, filters: FilterState): boolean {
  if (filters.location.length > 0 && !filters.location.includes(deal.shared.geography.msa)) return false
  if (filters.status.length > 0 && !filters.status.includes(deal.status)) return false
  if (filters.assetType.length > 0 && !filters.assetType.includes(deal.assetSubType)) return false
  if (filters.priceRange) {
    const [minFilter, maxFilter] = filters.priceRange
    const dealMin = deal.shared.priceRange?.min ?? deal.shared.exactPrice ?? 0
    const dealMax = deal.shared.priceRange?.max ?? deal.shared.exactPrice ?? 0
    if (dealMax < minFilter || dealMin > maxFilter) return false
  }
  if (filters.dealStage.length > 0 && !filters.dealStage.includes(deal.shared.dealStage)) return false
  if (filters.stage.length > 0 && !filters.stage.includes(deal.currentStage)) return false
  return true
}

const STATS = [
  { label: 'Deal Rooms Open', value: MOCK_SELLER_PERFORMANCE.dealRoomsOpen },
  { label: 'Deals Started', value: MOCK_SELLER_PERFORMANCE.disposStarted },
  { label: 'Deals Cancelled', value: MOCK_SELLER_PERFORMANCE.dealsCanceled },
  { label: 'Deals Closed', value: MOCK_SELLER_PERFORMANCE.dealsClosed },
]

interface SellingListProps {
  onOpenDealRoom?: (deal: DealRoom) => void
}

export default function SellingList({ onOpenDealRoom }: SellingListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [previewDeal, setPreviewDeal] = useState<DealRoom | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const hasFilters = !isFiltersEmpty(activeFilters)
  const chips = hasFilters ? getActiveChips(activeFilters) : []

  const filteredDeals = MOCK_SELLER_DEAL_ROOMS.filter((deal) => {
    // Filter match
    if (!matchesFilters(deal, activeFilters)) return false

    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const name = deal.name.toLowerCase()
      const msa = deal.shared.geography.msa.toLowerCase()
      const cities = (deal.shared.geography.cities ?? []).map((c) => c.toLowerCase()).join(' ')
      const subtype = deal.assetSubType.toLowerCase()
      if (!name.includes(q) && !msa.includes(q) && !cities.includes(q) && !subtype.includes(q)) {
        return false
      }
    }

    return true
  })

  function removeChip(key: keyof FilterState, value: string | number) {
    if (key === 'priceRange') {
      setActiveFilters((prev) => ({ ...prev, priceRange: null }))
      return
    }
    setActiveFilters((prev) => ({
      ...prev,
      [key]: (prev[key] as (string | number)[]).filter((v) => v !== value),
    }))
  }

  function clearAllFilters() {
    setActiveFilters(EMPTY_FILTERS)
  }

  return (
    <div className="px-4 sm:px-6 py-5 space-y-5 max-w-[1600px] mx-auto min-w-0">
      {/* Breadcrumb — below the sidebar toggle icon */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Home size={13} className="text-muted-foreground" />
        <span>&gt;</span>
        <span>Sell</span>
        <span>&gt;</span>
        <span className="text-foreground font-medium">Your Listings</span>
      </nav>

      {/* Page header + stats */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Your Listings</h1>
        <StatTileGrid className="sm:grid-cols-4">
          {STATS.map((stat) => (
            <StatTile key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </StatTileGrid>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your listings..."
              className="w-full rounded-lg border border-border bg-main py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-mode-sell/50 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm transition-colors',
              hasFilters
                ? 'border-mode-sell/50 text-mode-sell bg-mode-sell/5'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasFilters && (
              <span className="ml-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-mode-sell text-[10px] font-semibold text-white">
                {chips.length}
              </span>
            )}
          </button>
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-lg border border-border">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex items-center justify-center rounded-l-lg p-2 transition-colors',
              viewMode === 'grid'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center justify-center rounded-r-lg p-2 transition-colors',
              viewMode === 'list'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span
              key={`${chip.key}-${chip.value}`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground"
            >
              {chip.label}
              <button
                onClick={() => removeChip(chip.key, chip.value)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Deal cards */}
      {filteredDeals.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onViewDetails={(e) => { triggerRef.current = e.currentTarget as HTMLButtonElement; setPreviewDeal(deal) }}
                onOpenDealRoom={
                  onOpenDealRoom
                    ? () => onOpenDealRoom(deal)
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex flex-col gap-2 min-w-fit">
              {filteredDeals.map((deal) => (
                <DealCardList
                  key={deal.id}
                  deal={deal}
                  onViewDetails={(e) => { triggerRef.current = e.currentTarget as HTMLButtonElement; setPreviewDeal(deal) }}
                  onOpenDealRoom={
                    onOpenDealRoom
                      ? () => onOpenDealRoom(deal)
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        )
      ) : searchQuery.trim() || hasFilters ? (
        <SellerListingsEmpty variant="no-results" />
      ) : null}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
        <span className="text-xs text-muted-foreground">
          Showing 1–{filteredDeals.length} of {filteredDeals.length}
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md text-xs transition-colors',
                page === 1
                  ? 'bg-mode-sell text-white font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

      {/* Deal Preview Modal */}
      <DealPreviewModal
        deal={previewDeal}
        open={previewDeal !== null}
        onOpenChange={(open) => { if (!open) { setPreviewDeal(null); triggerRef.current?.focus() } }}
        onOpenDealRoom={(dealId) => {
          setPreviewDeal(null)
          const deal = MOCK_SELLER_DEAL_ROOMS.find((d) => d.id === dealId)
          if (deal && onOpenDealRoom) onOpenDealRoom(deal)
        }}
      />

      {/* Filter Sheet */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={activeFilters}
        onApply={(filters) => {
          setActiveFilters(filters)
          setIsFilterOpen(false)
        }}
        onClear={() => {
          clearAllFilters()
          setIsFilterOpen(false)
        }}
        locationOptions={LOCATION_OPTIONS}
        stageOptions={STAGE_OPTIONS}
        priceRangeConfig={PRICE_RANGE_CONFIG}
      />
    </div>
  )
}
