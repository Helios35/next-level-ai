import { useEffect, useRef, useState } from 'react'
import { X, Building2, Home, MapPin, DollarSign, HardHat, Users } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { StatTile, StatTileGrid } from '@/components/ui/stat-tile'
import { DataTable } from '@/components/ui/data-table'
import { DataTableHeader } from '@/components/ui/data-table-header'
import { DataTableFooter } from '@/components/ui/data-table-footer'
import type { Column } from '@/components/ui/data-table.types'
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle'
import { usePagination } from '@/hooks/usePagination'
import { ASSET_SUBTYPE_LABELS, DEAL_STAGE_LABELS, formatPrice } from '@/utils/dealFormatters'
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
import MatchScoreRing from '@/components/MatchScoreRing'
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

// Mirrors BUYER_CTA_MAP in DealCard.tsx — keep in sync
const BUYER_CTA_LABEL: Record<BuyerCtaState, { label: string; enabled: boolean }> = {
  coming_soon: { label: 'Indicate Interest', enabled: true },
  request_access: { label: 'Request Access', enabled: true },
  access_pending: { label: 'Access Pending', enabled: false },
  wait_queue: { label: 'Wait Queue', enabled: false },
  enter_deal_room: { label: 'Enter Deal Room', enabled: true },
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

function priceSortKey(deal: DealRoom): number {
  return deal.shared.exactPrice ?? deal.shared.priceRange?.min ?? 0
}

// ── Component ───────────────────────────────────────────────────────────────

interface YourDealsProps {
  onOpenDealRoom: (dealId: string) => void
}

export default function YourDeals({ onOpenDealRoom }: YourDealsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
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

  const { pagedData, totalCount, pageSize, currentPage, setPage } = usePagination(
    filteredDeals,
    { pageSize: 12, resetKey: `${searchQuery}|${JSON.stringify(activeFilters)}` },
  )

  function handleCtaClick(deal: DealRoom, effectiveState: BuyerCtaState | undefined) {
    if (!effectiveState) return
    if (effectiveState === 'enter_deal_room') {
      onOpenDealRoom(deal.id)
    } else if (effectiveState === 'request_access') {
      if (!mockUser.qualificationComplete) {
        setPendingAccessDealId(deal.id)
        setQualModalOpen(true)
      } else {
        setRequestedDealIds((prev) => new Set(prev).add(deal.id))
      }
    } else if (effectiveState === 'coming_soon') {
      // Optimistic "Indicate Interest" — no state change needed beyond visual
    }
  }

  // ── Buyer columns ───────────────────────────────────────────────────────
  const buyerColumns: Column<DealRoom>[] = [
    {
      key: 'name',
      label: 'Deal',
      sortable: true,
      sortAccessor: (row) => row.name,
      width: '260px',
      render: (row) => {
        const AssetIcon = row.assetSubType === 'sfr_portfolio' ? Home : Building2
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <AssetIcon size={16} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground leading-snug truncate">
                {row.name}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                <MapPin size={10} className="shrink-0" />
                {row.shared.geography.msa.split(',')[0]}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'matchScore',
      label: 'Match',
      sortable: true,
      sortAccessor: (row) => BUYER_DEAL_MAP[row.id]?.matchScore ?? 0,
      align: 'center',
      render: (row) => {
        const score = BUYER_DEAL_MAP[row.id]?.matchScore ?? 0
        return <MatchScoreRing score={score} size={36} colorMode="buy" />
      },
    },
    {
      key: 'assetSubType',
      label: 'Asset Type',
      sortable: true,
      sortAccessor: (row) => ASSET_SUBTYPE_LABELS[row.assetSubType],
      hideBelow: 'sm',
      render: (row) => (
        <span className="inline-flex items-center gap-1">
          <Building2 size={12} className="shrink-0" />
          {ASSET_SUBTYPE_LABELS[row.assetSubType]}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      sortAccessor: priceSortKey,
      align: 'right',
      hideBelow: 'sm',
      render: (row) => {
        const ctaState = BUYER_DEAL_MAP[row.id]?.buyerCtaState
        const effective = requestedDealIds.has(row.id) ? 'access_pending' : ctaState
        const blurred = effective !== 'enter_deal_room'
        return (
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <DollarSign size={12} className="shrink-0" />
            <span className={blurred ? 'blur-sm select-none pointer-events-none' : ''}>
              {formatPrice(row)}
            </span>
          </span>
        )
      },
    },
    {
      key: 'dealStage',
      label: 'Dev Stage',
      sortable: true,
      sortAccessor: (row) => DEAL_STAGE_LABELS[row.shared.dealStage],
      hideBelow: 'md',
      render: (row) => (
        <span className="inline-flex items-center gap-1">
          <HardHat size={12} className="shrink-0" />
          {DEAL_STAGE_LABELS[row.shared.dealStage]}
        </span>
      ),
    },
    {
      key: 'seats',
      label: 'Seats',
      sortable: true,
      sortAccessor: (row) => SEATED_COUNT_MAP[row.id] ?? 0,
      align: 'center',
      hideBelow: 'md',
      render: (row) => {
        const seated = SEATED_COUNT_MAP[row.id] ?? 0
        return (
          <span className="inline-flex items-center gap-1">
            <Users size={13} className="shrink-0 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              {seated}/3
            </span>
          </span>
        )
      },
    },
    {
      key: 'cta',
      label: '',
      align: 'right',
      render: (row) => {
        const ctaState = BUYER_DEAL_MAP[row.id]?.buyerCtaState
        const effective: BuyerCtaState | undefined = requestedDealIds.has(row.id)
          ? 'access_pending'
          : ctaState
        if (!effective) return null
        const cfg = BUYER_CTA_LABEL[effective]
        const isPrimary = effective === 'enter_deal_room'
        return (
          <button
            type="button"
            disabled={!cfg.enabled}
            onClick={(e) => {
              e.stopPropagation()
              handleCtaClick(row, effective)
            }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-opacity',
              isPrimary
                ? 'bg-mode-buy text-white hover:opacity-90'
                : cfg.enabled
                  ? 'border border-border text-foreground hover:bg-muted'
                  : 'border border-border text-muted-foreground cursor-not-allowed opacity-60',
            )}
          >
            {cfg.label}
          </button>
        )
      },
    },
  ]

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
      {/* Page heading + stats */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold text-foreground">Your Deals</h1>
          <span className="text-sm text-muted-foreground">{filteredDeals.length} matches</span>
        </div>
        <StatTileGrid className="grid-cols-3">
          <StatTile value={2} label="Deal Rooms Accessed" />
          <StatTile value={1} label="Offers Made" />
          <StatTile value={0} label="Deals Won" />
        </StatTileGrid>
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

      {/* Toolbar: search + filters + view toggle */}
      <DataTableHeader
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search deals..."
        filterCount={chips.length}
        onOpenFilters={() => setIsFilterOpen(true)}
        actions={<ViewToggle value={viewMode} onChange={setViewMode} />}
      />

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

      {/* Content */}
      {!mockUser.hasStrategy ? (
        <BuyerEmptyState
          variant="no-strategy"
          accentMode="buy"
          onCTA={() => setStrategyModalOpen(true)}
        />
      ) : filteredDeals.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {pagedData.map((deal) => {
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
          ) : (
            <DataTable
              columns={buyerColumns}
              data={pagedData}
              rowKey={(d) => d.id}
              onRowClick={(deal) => {
                triggerRef.current = null
                setPreviewDeal(deal)
              }}
              emptyMessage="No deals match your filters."
              defaultSort={{ key: 'matchScore', direction: 'desc' }}
            />
          )}
          <DataTableFooter
            totalCount={totalCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setPage}
          />
        </>
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
