import { useState, useCallback, useMemo } from 'react'
import StrategyCard from '@/components/StrategyCard'
import ActiveDealRoomsCallout from '@/components/ActiveDealRoomsCallout'
import BuyerEmptyState from '@/components/BuyerEmptyState'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { MOCK_BUYER_STRATEGIES } from '@/data/mock/buyerStrategies'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'

interface YourStrategiesProps {
  onCreateStrategy: () => void
  onEditStrategy: (strategyId: string) => void
  onOpenDealRoom?: (dealId: string) => void
}

export default function YourStrategies({ onCreateStrategy, onEditStrategy, onOpenDealRoom }: YourStrategiesProps) {
  const strategies = MOCK_BUYER_STRATEGIES
  const [expandedCallouts, setExpandedCallouts] = useState<Record<string, boolean>>({})

  const toggleCallout = useCallback((strategyId: string) => {
    setExpandedCallouts((prev) => ({ ...prev, [strategyId]: !prev[strategyId] }))
  }, [])

  const dealsByStrategy = useMemo(() => {
    const map: Record<string, typeof MOCK_SELLER_DEAL_ROOMS> = {}
    for (const s of strategies) {
      if (s.activeDealRoomIds?.length) {
        map[s.id] = MOCK_SELLER_DEAL_ROOMS.filter((d) => s.activeDealRoomIds!.includes(d.id))
      }
    }
    return map
  }, [strategies])

  if (strategies.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <div className="px-6 py-5 space-y-3">
          <Breadcrumbs items={[{ label: 'Strategy' }, { label: 'Your Strategies' }]} />
          <h1 className="text-xl font-semibold text-foreground">Your Strategies</h1>
        </div>
        <BuyerEmptyState variant="no-strategies" onCTA={onCreateStrategy} accentMode="strategy" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="px-6 py-5 space-y-3">
        <Breadcrumbs items={[{ label: 'Strategy' }, { label: 'Your Strategies' }]} />
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Your Strategies</h1>
          <button
            onClick={onCreateStrategy}
            className="rounded-lg bg-mode-strategy px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Create Strategy
          </button>
        </div>
      </div>
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {strategies.map((strategy) => {
            const isExpanded = expandedCallouts[strategy.id] ?? false
            const deals = dealsByStrategy[strategy.id] ?? []
            const hasActiveDealRooms = strategy.activeDealRoomCount > 0

            return (
              <div key={strategy.id} className="flex flex-col gap-3 col-span-1">
                <StrategyCard
                  strategy={strategy}
                  onEdit={() => onEditStrategy(strategy.id)}
                  onPause={() => console.log('pause', strategy.id)}
                  onResume={() => console.log('resume', strategy.id)}
                  onViewDealRooms={() => toggleCallout(strategy.id)}
                />
                {hasActiveDealRooms && isExpanded && (
                  <ActiveDealRoomsCallout
                    deals={deals}
                    strategyName={strategy.name}
                    open={isExpanded}
                    onOpenChange={() => toggleCallout(strategy.id)}
                    onOpenDealRoom={onOpenDealRoom}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
