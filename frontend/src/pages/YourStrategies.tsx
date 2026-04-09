import StrategyCard from '@/components/StrategyCard'
import BuyerEmptyState from '@/components/BuyerEmptyState'
import { MOCK_BUYER_STRATEGIES } from '@/data/mock/buyerStrategies'

interface YourStrategiesProps {
  onCreateStrategy: () => void
  onEditStrategy: (strategyId: string) => void
}

export default function YourStrategies({ onCreateStrategy, onEditStrategy }: YourStrategiesProps) {
  const strategies = MOCK_BUYER_STRATEGIES

  if (strategies.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <div className="px-6 py-5">
          <h1 className="text-xl font-semibold text-foreground">Your Strategies</h1>
        </div>
        <BuyerEmptyState variant="no-strategies" onCTA={onCreateStrategy} accentMode="strategy" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="px-6 py-5">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {strategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              onEdit={() => onEditStrategy(strategy.id)}
              onPause={() => console.log('pause', strategy.id)}
              onResume={() => console.log('resume', strategy.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
