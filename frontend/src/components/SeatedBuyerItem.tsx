import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item'
import { Badge } from '@/components/ui/badge'
import MatchScoreRing from '@/components/MatchScoreRing'

interface SeatedBuyerItemProps {
  label: string
  rank: number
  qualified: boolean
  score: number
  equity: string
  activity: string
  colorMode?: 'sell' | 'buy'
  className?: string
}

function SeatedBuyerItem({ label, rank, qualified, score, equity, activity, colorMode = 'sell', className }: SeatedBuyerItemProps) {
  return (
    <Item variant="outline" className={className ?? 'flex-nowrap px-4 py-3'}>
      <ItemMedia variant="icon">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
          #{rank}
        </span>
      </ItemMedia>

      <ItemContent className="min-w-0">
        <ItemTitle className="w-auto">
          {label}
          {qualified && (
            <Badge size="sm" className="border-transparent bg-green-500/20 text-green-400">
              Qualified
            </Badge>
          )}
          <Badge size="sm" className={colorMode === 'buy' ? 'border-transparent bg-mode-buy/15 text-mode-buy' : 'border-transparent bg-mode-sell/15 text-mode-sell'}>
            Seated
          </Badge>
        </ItemTitle>
        <ItemDescription>{activity}</ItemDescription>
      </ItemContent>

      <ItemActions className="shrink-0 gap-4">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Equity</p>
          <p className="text-xs font-medium text-foreground">{equity}</p>
        </div>
        <MatchScoreRing score={score} size={36} strokeWidth={2.5} colorMode={colorMode} />
      </ItemActions>
    </Item>
  )
}

export default SeatedBuyerItem
