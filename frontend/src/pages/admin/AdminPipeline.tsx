import { useMemo, useState } from 'react'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

type PipelineFilter = 'all' | 'stage' | 'status'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function relativeDate(iso: string): string {
  const now = new Date()
  const date = new Date(iso)
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

interface AdminPipelineProps {
  onNavigateToDeal: (dealId: string) => void
}

export default function AdminPipeline({ onNavigateToDeal }: AdminPipelineProps) {
  const [filter, setFilter] = useState<PipelineFilter>('all')
  const [stageFilter, setStageFilter] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<DealRoomStatus | null>(null)

  const deals = useMemo(() => {
    let list = [...MOCK_SELLER_DEAL_ROOMS]
    if (filter === 'stage' && stageFilter !== null) {
      list = list.filter((d) => d.currentStage === stageFilter)
    }
    if (filter === 'status' && statusFilter !== null) {
      list = list.filter((d) => d.status === statusFilter)
    }
    return list.sort((a, b) => b.currentStage - a.currentStage)
  }, [filter, stageFilter, statusFilter])

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Breadcrumbs className="mb-4" items={[{ label: 'Pipeline' }]} />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Pipeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All deals across all stages and statuses.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs value={filter} onValueChange={(v) => { setFilter(v as PipelineFilter); setStageFilter(null); setStatusFilter(null) }}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="stage">By Stage</TabsTrigger>
            <TabsTrigger value="status">By Status</TabsTrigger>
          </TabsList>
        </Tabs>

        {filter === 'stage' && (
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((stage) => (
              <button
                key={stage}
                onClick={() => setStageFilter(stageFilter === stage ? null : stage)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  stageFilter === stage
                    ? 'bg-slate-600 text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        )}

        {filter === 'status' && (
          <div className="flex flex-wrap gap-1.5">
            {(['active', 'market_tested', 'dormant', 'closed', 'withdrawn'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-slate-600 text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Deal Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Seller</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stage</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Submitted</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => {
              const isStage3 = deal.currentStage === 3
              return (
                <tr
                  key={deal.id}
                  className={`border-b border-border last:border-0 ${
                    deal.status === 'dormant' ? 'opacity-50' : ''
                  } ${isStage3 ? 'cursor-pointer hover:bg-muted/30' : ''}`}
                  onClick={isStage3 ? () => onNavigateToDeal(deal.id) : undefined}
                >
                  <td className="px-4 py-3">
                    <span className={`font-medium ${isStage3 ? 'text-foreground underline underline-offset-2' : 'text-foreground'}`}>
                      {deal.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {SELLER_NAMES[deal.sellerId] ?? 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Stage {deal.currentStage} — {STAGE_LABELS[deal.currentStage] ?? ''}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={STATUS_BADGE_CLASS[deal.status]}>
                      {STATUS_LABELS[deal.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(deal.createdAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{relativeDate(deal.updatedAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
