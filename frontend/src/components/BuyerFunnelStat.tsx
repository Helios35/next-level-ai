import { ChevronRight } from 'lucide-react'
import type { BuyerPoolEntry } from '@shared/types/buyerPool'

interface BuyerFunnelStatProps {
  buyers: BuyerPoolEntry[]
}

const SEAT_CAP = 3

export default function BuyerFunnelStat({ buyers }: BuyerFunnelStatProps) {
  const buyerPool = buyers.length
  const invited = buyers.filter(
    (b) => b.outreachStatus === 'sent' || b.outreachStatus === 'opened' || b.outreachStatus === 'responded',
  ).length
  const accepted = buyers.filter((b) => b.seatStatus === 'accepted').length
  const activeSeats = buyers.filter((b) => b.seatStatus === 'seated').length
  const passes = buyers.filter((b) => b.seatStatus === 'passed').length

  const stages: { label: string; value: string }[] = [
    { label: 'Buyer Pool', value: String(buyerPool) },
    { label: 'Invited', value: String(invited) },
    { label: 'Accepted', value: String(accepted) },
    { label: 'Active Seats', value: `${activeSeats}/${SEAT_CAP}` },
    { label: 'Passes', value: String(passes) },
  ]

  return (
    <div className="flex items-center gap-1.5">
      {stages.map((stage, i) => (
        <div key={stage.label} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/30 border border-border px-3 py-2 min-w-0">
            <span className="text-lg font-bold text-foreground tabular-nums leading-tight">
              {stage.value}
            </span>
            <span className="text-[10px] text-muted-foreground leading-snug whitespace-nowrap">
              {stage.label}
            </span>
          </div>
          {i < stages.length - 1 && (
            <ChevronRight size={14} className="shrink-0 text-muted-foreground/50" />
          )}
        </div>
      ))}
    </div>
  )
}
