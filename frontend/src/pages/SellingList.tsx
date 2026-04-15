import { useMemo, useRef, useState } from 'react'
import { X, Building2, Home, MapPin, DollarSign, HardHat, Users } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import type { DealRoom } from '@shared/types/dealRoom'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { MOCK_SELLER_PERFORMANCE } from '@/data/mock/users'
import DealCard from '@/components/DealCard'
import DealPreviewModal from '@/components/DealPreviewModal'
import SellerListingsEmpty from '@/components/SellerListingsEmpty'
import StatusBadge from '@/components/StatusBadge'
import StageProgressBar from '@/components/StageProgressBar'
import { StatTile, StatTileGrid } from '@/components/ui/stat-tile'
import { DataTable } from '@/components/ui/data-table'
import { DataTableHeader } from '@/components/ui/data-table-header'
import { DataTableFooter } from '@/components/ui/data-table-footer'
import type { Column } from '@/components/ui/data-table.types'
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle'
import { usePagination } from '@/hooks/usePagination'
import { ASSET_SUBTYPE_LABELS, DEAL_STAGE_LABELS, formatPrice } from '@/utils/dealFormatters'
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

function priceSortKey(deal: DealRoom): number {
  return deal.shared.exactPrice ?? deal.shared.priceRange?.min ?? 0
}

const STATS = [
  { label: 'Deal Rooms Open', value: MOCK_SELLER_PERFORMANCE.dealRoomsOpen },
  { label: 'Deals Started', value: MOCK_SELLER_PERFORMANCE.disposStarted },
  { label: 'Deals Cancelled', value: MOCK_SELLER_PERFORMANCE.dealsCanceled },
  { label: 'Deals Closed', value: MOCK_SELLER_PERFORMANCE.dealsClosed },
]

interface SellingListProps {
  onOpenDealRoom?: (deal: DealRoom) => void
  onCreateListing?: () => void
}

export default function SellingList({ onOpenDealRoom, onCreateListing }: SellingListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [previewDeal, setPreviewDeal] = useState<DealRoom | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const hasFilters = !isFiltersEmpty(activeFilters)
  const chips = hasFilters ? getActiveChips(activeFilters) : []

  const filteredDeals = MOCK_SELLER_DEAL_ROOMS.filter((deal) => {
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

  const { pagedData, totalCount, pageSize, currentPage, setPage } = usePagination(
    filteredDeals,
    { pageSize: 12, resetKey: `${searchQuery}|${JSON.stringify(activeFilters)}` },
  )

  // ── Seller columns ──────────────────────────────────────────────────────
  const sellerColumns: Column<DealRoom>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Listing',
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
        key: 'status',
        label: 'Status',
        sortable: true,
        sortAccessor: (row) => row.status,
        render: (row) => <StatusBadge status={row.status} />,
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
        render: (row) => (
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <DollarSign size={12} className="shrink-0" />
            {formatPrice(row)}
          </span>
        ),
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
        key: 'progress',
        label: 'Progress',
        sortable: true,
        sortAccessor: (row) => row.currentStage,
        hideBelow: 'lg',
        render: (row) => <StageProgressBar currentStage={row.currentStage} showLabel={false} />,
      },
      {
        key: 'buyers',
        label: 'Buyers',
        sortable: true,
        sortAccessor: (row) => row.matchedBuyerCount,
        align: 'center',
        render: (row) => (
          <span className="inline-flex items-center gap-1">
            <Users size={13} className="shrink-0 text-muted-foreground" />
            <span className="font-semibold text-foreground">{row.matchedBuyerCount}</span>
          </span>
        ),
      },
      {
        key: 'actions',
        label: '',
        align: 'right',
        render: (row) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation()
                triggerRef.current = e.currentTarget as HTMLButtonElement
                setPreviewDeal(row)
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors whitespace-nowrap"
            >
              View Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenDealRoom?.(row)
              }}
              className="rounded-lg bg-mode-sell px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Open Deal Room
            </button>
          </div>
        ),
      },
    ],
    [onOpenDealRoom],
  )

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
      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Sell' }, { label: 'Your Listings' }]} />

      {/* Page header + stats */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Your Listings</h1>
        <StatTileGrid className="sm:grid-cols-4">
          {STATS.map((stat) => (
            <StatTile key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </StatTileGrid>
      </div>

      {/* Toolbar: search + filters + view toggle */}
      <DataTableHeader
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search your listings..."
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
      {MOCK_SELLER_DEAL_ROOMS.length === 0 ? (
        <SellerListingsEmpty variant="no-listings" onCTA={onCreateListing} />
      ) : filteredDeals.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {pagedData.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onViewDetails={(e) => {
                    triggerRef.current = e.currentTarget as HTMLButtonElement
                    setPreviewDeal(deal)
                  }}
                  onOpenDealRoom={
                    onOpenDealRoom ? () => onOpenDealRoom(deal) : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <DataTable
              columns={sellerColumns}
              data={pagedData}
              rowKey={(d) => d.id}
              onRowClick={(deal) => {
                triggerRef.current = null
                setPreviewDeal(deal)
              }}
              emptyMessage="No listings match your filters."
              defaultSort={{ key: 'name', direction: 'asc' }}
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
        <SellerListingsEmpty variant="no-results" />
      ) : null}

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
