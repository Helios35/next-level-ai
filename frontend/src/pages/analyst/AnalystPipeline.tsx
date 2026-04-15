import { useMemo } from 'react'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import type { DealRoomStatus } from '@shared/types/enums'

const STAGE_LABELS: Record<number, string> = {
  1: 'Intake',
  2: 'Submission',
  3: 'QA Review',
  4: 'Financial Analysis',
  5: 'Decision Point',
  6: 'Coming Soon',
  7: 'Active Disposition',
  8: 'Offer Negotiation',
  9: 'Accepted Offer',
}

const STATUS_LABELS: Record<DealRoomStatus, string> = {
  active: 'Active',
  market_tested: 'Market Tested',
  dormant: 'Dormant',
  closed: 'Closed',
  withdrawn: 'Withdrawn',
  draft: 'Draft',
}

const STATUS_BADGE_CLASS: Record<DealRoomStatus, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  market_tested: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  dormant: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
  closed: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  withdrawn: 'border-red-500/30 bg-red-500/10 text-red-400',
  draft: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
}

const SELLER_NAMES: Record<string, string> = {
  user_001: 'Nathan Ivy',
  user_009: 'Jordan Fields',
  user_010: 'Carol Tran',
}

function formatDate(iso: string): string {
  const now = new Date()
  const date = new Date(iso)
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AnalystPipeline() {
  const deals = useMemo(
    () => [...MOCK_SELLER_DEAL_ROOMS].sort((a, b) => b.currentStage - a.currentStage),
    []
  )

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Breadcrumbs className="mb-4" items={[{ label: 'Pipeline' }]} />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Pipeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Full pipeline visibility across all stages. Read-only.
        </p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Deal Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stage</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Seller</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr
                key={deal.id}
                className={`border-b border-border last:border-0 ${
                  deal.status === 'dormant' ? 'opacity-50' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium text-foreground">{deal.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Stage {deal.currentStage} — {STAGE_LABELS[deal.currentStage] ?? ''}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={STATUS_BADGE_CLASS[deal.status]}>
                    {STATUS_LABELS[deal.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {SELLER_NAMES[deal.sellerId] ?? 'Unknown'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(deal.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
