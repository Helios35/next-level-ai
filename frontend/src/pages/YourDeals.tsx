import { useEffect, useRef, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import type { DealRoom } from '@shared/types/dealRoom'
import type { BuyerCtaState } from '@shared/types/buyerStrategy'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { MOCK_BUYER_POOL_DR001, MOCK_BUYER_POOL_DR002, MOCK_BUYER_POOL_DR005 } from '@/data/mock/buyerPool'
import DealCard from '@/components/DealCard'
import DealPreviewModal from '@/components/DealPreviewModal'
import BuyerEmptyState from '@/components/BuyerEmptyState'
import QualificationModal from '@/components/QualificationModal'
import StrategyPromptModal from '@/components/StrategyPromptModal'
import QualificationNudgeBanner from '@/components/QualificationNudgeBanner'
import FilterModal, {
  type FilterState,
  EMPTY_FILTERS,
  isFiltersEmpty,
} from '@/components/FilterModal'

// Prototype: mock user qualification state
const mockUser = { qualificationComplete: false, hasStrategy: true }

// ── Filter config (mirrors SellingList) ─────────────────────────────────────

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

// ── Local buyer mock mapping ────────────────────────────────────────────────

// Derive seated buyer counts from mock buyer pool data
const ALL_BUYER_POOL = [...MOCK_BUYER_POOL_DR001, ...MOCK_BUYER_POOL_DR002, ...MOCK_BUYER_POOL_DR005]
const SEATED_COUNT_MAP: Record<string, number> = ALL_BUYER_POOL.reduce((acc, entry) => {
  if (entry.seatStatus === 'seated') {
    acc[entry.dealRoomId] = (acc[entry.dealRoomId] ?? 0) + 1
  }
  return acc
}, {} as Record<string, number>)

const BUYER_DEAL_MAP: Record<string, { buyerCtaState: BuyerCtaState; matchScore: number }> = {
  dr_001: { buyerCtaState: 'enter_deal_room', matchScore: 94 },
  dr_002: { buyerCtaState: 'coming_soon', matchScore: 82 },
  dr_005: { buyerCtaState: 'request_access', matchScore: 76 },
  dr_006: { buyerCtaState: 'access_pending', matchScore: 61 },
}

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// ── Component ───────────────────────────────────────────────────────────────

interface YourDealsProps {
  onOpenDealRoom: (dealId: string) => void
}

export default function YourDeals({ onOpenDealRoom }: YourDealsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [previewDeal, setPreviewDeal] = useState<DealRoom | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const [qualModalOpen, setQualModalOpen] = useState(false)
  const [strategyModalOpen, setStrategyModalOpen] = useState(false)
  const [nudgeBannerDismissed, setNudgeBannerDismissed] = useState(false)
  const [pendingAccessDealId, setPendingAccessDealId] = useState<string | null>(null)
  const [requestedDealIds, setRequestedDealIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!mockUser.hasStrategy) setStrategyModalOpen(true)
  }, [])

  const hasFilters = !isFiltersEmpty(activeFilters)
  const chips = hasFilters ? getActiveChips(activeFilters) : []

  // Filter + search + sort by matchScore descending
  const filteredDeals = MOCK_SELLER_DEAL_ROOMS
    .filter((deal) => {
      if (!BUYER_DEAL_MAP[deal.id]) return false
      if (!matchesFilters(deal, activeFilters)) return false
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
    .sort((a, b) => (BUYER_DEAL_MAP[b.id]?.matchScore ?? 0) - (BUYER_DEAL_MAP[a.id]?.matchScore ?? 0))

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
      <Breadcrumbs items={[{ label: 'Buy' }, { label: 'Your Deals' }]} />
      {/* Page heading */}
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold text-foreground">Your Deals</h1>
        <span className="text-sm text-muted-foreground">{filteredDeals.length} matches</span>
      </div>

      {/* Qualification nudge banner */}
      {!mockUser.qualificationComplete &&
        mockUser.hasStrategy &&
        !nudgeBannerDismissed && (
          <QualificationNudgeBanner
            onComplete={() => {
              /* TODO: route to qualification form */
              console.log('Route to qualification form')
            }}
            onDismiss={() => setNudgeBannerDismissed(true)}
          />
        )}

      {/* Search + filter bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:flex-none sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search deals..."
            className="w-full rounded-lg border border-border bg-main py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-mode-buy/50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm transition-colors',
            hasFilters
              ? 'border-mode-buy/50 text-mode-buy bg-mode-buy/5'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasFilters && (
            <span className="ml-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-mode-buy text-[10px] font-semibold text-white">
              {chips.length}
            </span>
          )}
        </button>
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

      {/* Deal card grid */}
      {!mockUser.hasStrategy ? (
        <BuyerEmptyState
          variant="no-strategy"
          accentMode="buy"
          onCTA={() => setStrategyModalOpen(true)}
        />
      ) : filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredDeals.map((deal) => {
            const buyerInfo = BUYER_DEAL_MAP[deal.id]
            const effectiveCtaState: BuyerCtaState | undefined = requestedDealIds.has(deal.id)
              ? 'access_pending'
              : buyerInfo?.buyerCtaState
            return (
              <DealCard
                key={deal.id}
                deal={deal}
                mode="buy"
                buyerCtaState={effectiveCtaState}
                matchScore={buyerInfo?.matchScore}
                seatedBuyerCount={SEATED_COUNT_MAP[deal.id] ?? 0}
                maxSeats={3}
                onViewDetails={(e) => {
                  triggerRef.current = e.currentTarget as HTMLButtonElement
                  setPreviewDeal(deal)
                }}
                onOpenDealRoom={() => onOpenDealRoom(deal.id)}
                onRequestAccess={() => {
                  if (!mockUser.qualificationComplete) {
                    setPendingAccessDealId(deal.id)
                    setQualModalOpen(true)
                  } else {
                    setRequestedDealIds((prev) => new Set(prev).add(deal.id))
                  }
                }}
              />
            )
          })}
        </div>
      ) : searchQuery.trim() || hasFilters ? (
        <BuyerEmptyState variant="no-results" onCTA={clearAllFilters} />
      ) : null}

      {/* Deal Preview Modal */}
      <DealPreviewModal
        deal={previewDeal}
        open={previewDeal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewDeal(null)
            triggerRef.current?.focus()
          }
        }}
        onOpenDealRoom={(dealId) => {
          setPreviewDeal(null)
          onOpenDealRoom(dealId)
        }}
        viewer="buyer"
        buyerCtaState={previewDeal ? BUYER_DEAL_MAP[previewDeal.id]?.buyerCtaState : undefined}
        matchScore={previewDeal ? BUYER_DEAL_MAP[previewDeal.id]?.matchScore : undefined}
      />

      {/* Qualification soft-gate modal (access request trigger) */}
      <QualificationModal
        open={qualModalOpen}
        onOpenChange={setQualModalOpen}
        trigger="access_request"
        onCompleteProfile={() => {
          setQualModalOpen(false)
          setPendingAccessDealId(null)
          /* TODO: route to qualification form */
          console.log('Route to qualification form')
        }}
        onSkip={() => {
          if (pendingAccessDealId) {
            setRequestedDealIds((prev) => new Set(prev).add(pendingAccessDealId))
            setPendingAccessDealId(null)
          }
          setQualModalOpen(false)
        }}
      />

      {/* Strategy prompt modal */}
      <StrategyPromptModal
        open={strategyModalOpen}
        onOpenChange={setStrategyModalOpen}
        onCreateStrategy={() => {
          setStrategyModalOpen(false)
          /* TODO: route to CreateStrategyWizard */
          console.log('Route to CreateStrategyWizard')
        }}
        onDismiss={() => setStrategyModalOpen(false)}
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
