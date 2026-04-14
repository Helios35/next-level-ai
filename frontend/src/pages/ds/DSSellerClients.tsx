import { useMemo } from 'react'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'

// Seller contact lookup — matches DSDealView and DSPipeline
const SELLER_CONTACTS: Record<string, { name: string; email: string; phone: string }> = {
  user_001: { name: 'Marcus Webb', email: 'marcus.webb@trianglecap.com', phone: '(704) 555-0192' },
  user_009: { name: 'Jordan Fields', email: 'jordan@sunbeltdev.com', phone: '(615) 555-0314' },
  user_010: { name: 'Carol Tran', email: 'carol.tran@landmarkdev.com', phone: '(512) 555-0291' },
  user_011: { name: 'Brian Okafor', email: 'b.okafor@pinecresthomes.com', phone: '(480) 555-0178' },
  user_012: { name: 'Lisa Cheng', email: 'lisa.cheng@primevest.com', phone: '(919) 555-0133' },
  user_013: { name: 'Darren Brooks', email: 'darren@brooksgroupre.com', phone: '(214) 555-0245' },
  user_014: { name: 'Anika Patel', email: 'anika.patel@horizondev.com', phone: '(303) 555-0187' },
  user_015: { name: 'Tyler Moss', email: 'tyler@mossholdings.com', phone: '(404) 555-0272' },
  user_016: { name: 'Nina Reyes', email: 'nina.reyes@suncoastcap.com', phone: '(813) 555-0196' },
  user_017: { name: 'Kevin Strauss', email: 'kstrauss@straussdev.com', phone: '(512) 555-0318' },
  user_018: { name: 'Samira Hassan', email: 'samira@crescentgroup.com', phone: '(615) 555-0421' },
}

export { SELLER_CONTACTS }

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

interface DSSellerClientsProps {
  onNavigateToProfile: (sellerId: string) => void
}

export default function DSSellerClients({ onNavigateToProfile }: DSSellerClientsProps) {
  const sellers = useMemo(() => {
    const grouped = new Map<string, { sellerId: string; name: string; activeDeals: number; lastActivity: string }>()

    for (const deal of MOCK_SELLER_DEAL_ROOMS) {
      const existing = grouped.get(deal.sellerId)
      const isActive = deal.status === 'active' || deal.status === 'market_tested'
      if (existing) {
        if (isActive) existing.activeDeals++
        if (deal.updatedAt > existing.lastActivity) existing.lastActivity = deal.updatedAt
      } else {
        grouped.set(deal.sellerId, {
          sellerId: deal.sellerId,
          name: SELLER_CONTACTS[deal.sellerId]?.name ?? deal.sellerId,
          activeDeals: isActive ? 1 : 0,
          lastActivity: deal.updatedAt,
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
            <th className="px-4 py-3 font-medium">Seller Name</th>
            <th className="px-4 py-3 font-medium">Active Deals</th>
            <th className="px-4 py-3 font-medium">Last Activity</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((seller) => (
            <tr
              key={seller.sellerId}
              onClick={() => onNavigateToProfile(seller.sellerId)}
              className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-foreground">{seller.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{seller.activeDeals}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatRelativeTime(seller.lastActivity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
