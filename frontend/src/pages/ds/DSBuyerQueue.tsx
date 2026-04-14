import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { MOCK_BUYER_POOL_DR001, MOCK_BUYER_POOL_DR002, MOCK_BUYER_POOL_DR005 } from '@/data/mock/buyerPool'
import { DS_BUYER_NAMES, DS_BUYER_FIRM_TYPES } from '@/data/mock/dsConversations'
import type { BuyerPoolEntry } from '@shared/types/buyerPool'

const ALL_BUYER_POOL: BuyerPoolEntry[] = [
  ...MOCK_BUYER_POOL_DR001,
  ...MOCK_BUYER_POOL_DR002,
  ...MOCK_BUYER_POOL_DR005,
]

const QUAL_BADGE: Record<string, string> = {
  qualified: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  not_qualified: 'border-red-500/30 bg-red-500/10 text-red-400',
}

const SEAT_BADGE: Record<string, string> = {
  seated: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  invited: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  accepted: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  passed: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
}

const SEAT_LABELS: Record<string, string> = {
  seated: 'Seated', pending: 'Pending', invited: 'Invited',
  accepted: 'Accepted', passed: 'Passed',
}

function formatRelativeTime(iso: string): string {
  const now = new Date('2026-04-14T12:00:00Z')
  const then = new Date(iso)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

interface BuyerRow {
  buyerId: string
  name: string
  firmType: string
  qualificationStatus: string
  activeDeals: number
  mostRecentSeatStatus: string
  lastActivity: string
}

interface DSBuyerQueueProps {
  onNavigateToProfile: (buyerId: string) => void
}

export default function DSBuyerQueue({ onNavigateToProfile }: DSBuyerQueueProps) {
  const buyers = useMemo(() => {
    const grouped = new Map<string, BuyerRow>()

    for (const entry of ALL_BUYER_POOL) {
      const existing = grouped.get(entry.buyerId)
      const timestamp = entry.seatedAt ?? entry.accessRequestedAt ?? entry.passedAt ?? ''
      const isActive = entry.seatStatus === 'seated' || entry.seatStatus === 'pending' || entry.seatStatus === 'invited' || entry.seatStatus === 'accepted'

      if (existing) {
        if (isActive) existing.activeDeals++
        if (timestamp > existing.lastActivity) {
          existing.lastActivity = timestamp
          existing.mostRecentSeatStatus = entry.seatStatus
        }
      } else {
        grouped.set(entry.buyerId, {
          buyerId: entry.buyerId,
          name: DS_BUYER_NAMES[entry.buyerId] ?? entry.anonymizedLabel,
          firmType: DS_BUYER_FIRM_TYPES[entry.buyerId] ?? '—',
          qualificationStatus: entry.qualificationStatus,
          activeDeals: isActive ? 1 : 0,
          mostRecentSeatStatus: entry.seatStatus,
          lastActivity: timestamp,
        })
      }
    }

    return Array.from(grouped.values()).sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
  }, [])

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 font-medium">Buyer Name</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Firm Type</th>
            <th className="px-4 py-3 font-medium">Qualification</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Active Deals</th>
            <th className="px-4 py-3 font-medium">Seat Status</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Last Activity</th>
          </tr>
        </thead>
        <tbody>
          {buyers.map((buyer) => (
            <tr
              key={buyer.buyerId}
              onClick={() => onNavigateToProfile(buyer.buyerId)}
              className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-foreground">{buyer.name}</td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{buyer.firmType}</td>
              <td className="px-4 py-3">
                <Badge className={QUAL_BADGE[buyer.qualificationStatus] ?? ''}>
                  {buyer.qualificationStatus === 'qualified' ? 'Qualified' : 'Not Qualified'}
                </Badge>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{buyer.activeDeals}</td>
              <td className="px-4 py-3">
                <Badge className={SEAT_BADGE[buyer.mostRecentSeatStatus] ?? ''}>
                  {SEAT_LABELS[buyer.mostRecentSeatStatus] ?? buyer.mostRecentSeatStatus}
                </Badge>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                {buyer.lastActivity ? formatRelativeTime(buyer.lastActivity) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
