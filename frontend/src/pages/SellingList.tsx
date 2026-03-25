import { useState } from 'react'
import { Home, Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { DealRoom } from '@shared/types/dealRoom'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { MOCK_SELLER_PERFORMANCE } from '@/data/mock/users'
import DealCard from '@/components/DealCard'

// Only show dr_001, dr_002, dr_005 (exclude dr_006 dormant)
const LISTED_DEALS = MOCK_SELLER_DEAL_ROOMS.filter((d) => d.id !== 'dr_006')

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

  return (
    <div className="px-6 py-5 space-y-5">
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
        <div className="grid grid-cols-4 gap-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-0.5 rounded-lg bg-muted/30 border border-border px-4 py-3 min-w-0"
            >
              <span className="text-xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your listings..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-mode-sell/50 transition-colors"
              readOnly
            />
          </div>

          {/* Filters button */}
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <SlidersHorizontal size={15} />
            Filters
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

      {/* Deal card grid */}
      <div className="grid grid-cols-2 gap-4">
        {LISTED_DEALS.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onOpenDealRoom={
              deal.id === 'dr_001' && onOpenDealRoom
                ? () => onOpenDealRoom(deal)
                : undefined
            }
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-muted-foreground">
          Showing 1–3 of 3
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
    </div>
  )
}
