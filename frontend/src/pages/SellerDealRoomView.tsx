import { useCallback, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import {
  FileText, Users, BarChart2, Milestone,
  Upload, Check, Eye, RefreshCw, Lock, Clock,
} from 'lucide-react'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { MOCK_DEAL_PREVIEW_SELLER } from '@/data/mock/dealPreviews'
import { MOCK_BUYER_POOL_DR001, MOCK_BUYER_POOL_DR002, MOCK_BUYER_POOL_DR005 } from '@/data/mock/buyerPool'
import { MOCK_CHAT_SELLER_DR001, MOCK_CHAT_SELLER_DR002, MOCK_CHAT_SELLER_DR005 } from '@/data/mock/chat'
import { MOCK_MARKET_INTEL } from '@/data/mock/marketIntel'
import { MOCK_MILESTONES, POST_ACCEPTANCE_LABELS } from '@/data/mock/milestones'
import type { BuyerPoolEntry } from '@shared/types/buyerPool'
import type { DocumentUploadItem } from '@/data/mock/dealPreviews'
import type { MarketIntelData } from '@/data/mock/marketIntel'
import type { MilestoneItem } from '@/data/mock/milestones'
import DealRoomHeader from '@/components/DealRoomHeader'
import MarketTestedBanner from '@/components/MarketTestedBanner'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import MilestoneTimeline from '@/components/MilestoneTimeline'
import SeatedBuyerItem from '@/components/SeatedBuyerItem'
import SummaryCard from '@/components/SummaryCard'



import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DocumentListItem, DocumentListGroup } from '@/components/ui/document-list-item'
import {
  Item,
  ItemContent,
  ItemTitle,
} from '@/components/ui/item'
import { StatTile, StatTileGrid } from '@/components/ui/stat-tile'
import { Badge } from '@/components/ui/badge'
import { InfoCallout } from '@/components/ui/info-callout'
import { BarChartRow } from '@/components/ui/bar-chart-row'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

const DEFAULT_DEAL = MOCK_SELLER_DEAL_ROOMS.find((d) => d.id === 'dr_001')!

// ── Mock data lookups by dealId ────────────────────────────────────────────

const BUYER_POOL_BY_DEAL: Record<string, BuyerPoolEntry[]> = {
  dr_001: MOCK_BUYER_POOL_DR001,
  dr_002: MOCK_BUYER_POOL_DR002,
  dr_005: MOCK_BUYER_POOL_DR005,
}

const CHAT_BY_DEAL: Record<string, { role: 'ai' | 'seller'; sender: string; text: string; time: string }[]> = {
  dr_001: MOCK_CHAT_SELLER_DR001.map((m) => ({
    role: m.senderRole === 'seller' ? 'seller' as const : 'ai' as const,
    sender: m.senderLabel,
    text: m.content,
    time: new Date(m.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
  })),
  dr_002: MOCK_CHAT_SELLER_DR002.map((m) => ({
    role: m.senderRole === 'seller' ? 'seller' as const : 'ai' as const,
    sender: m.senderLabel,
    text: m.content,
    time: new Date(m.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
  })),
  dr_005: MOCK_CHAT_SELLER_DR005.map((m) => ({
    role: m.senderRole === 'seller' ? 'seller' as const : 'ai' as const,
    sender: m.senderLabel,
    text: m.content,
    time: new Date(m.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
  })),
}

// Exported for use in AppShell's persistent AI chat panel
export const DEAL_ROOM_CHAT_MESSAGES = CHAT_BY_DEAL['dr_001']
export { CHAT_BY_DEAL }

// ── Component ───────────────────────────────────────────────────────────────

interface SellerDealRoomViewProps {
  dealId?: string
  onBack?: () => void
}

// Tracks simulated upload/replace actions per document label
interface DocOverride {
  fileName: string
  uploadedAt: string
}

export default function SellerDealRoomView({ dealId, onBack }: SellerDealRoomViewProps) {
  const deal = dealId
    ? MOCK_SELLER_DEAL_ROOMS.find((d) => d.id === dealId) ?? DEFAULT_DEAL
    : DEFAULT_DEAL

  const id = deal.id
  const documents = MOCK_DEAL_PREVIEW_SELLER[id]?.documents ?? []
  const buyers = BUYER_POOL_BY_DEAL[id] ?? []
  const marketIntel = MOCK_MARKET_INTEL[id]
  const milestones = MOCK_MILESTONES[id] ?? []

  const [activeTab, setActiveTab] = useState('documents')

  // Document action state — lives here so it survives tab switches
  const [docOverrides, setDocOverrides] = useState<Record<string, DocOverride>>({})
  const [viewingDoc, setViewingDoc] = useState<DocumentUploadItem | null>(null)

  const handleDocUpload = useCallback((docLabel: string, fileName: string) => {
    setDocOverrides((prev) => ({
      ...prev,
      [docLabel]: {
        fileName,
        uploadedAt: new Date().toISOString(),
      },
    }))
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-4">
        <Breadcrumbs
          items={[
            { label: 'Sell' },
            { label: 'Your Listings', onClick: onBack },
            { label: deal.name },
          ]}
        />
      </div>
      {/* ═══ DEAL HEADER ═══ */}
      <DealRoomHeader
        deal={deal}
        buyerPoolCount={buyers.length}
        onBack={onBack}
      />

      {deal.status === 'market_tested' && (
        <MarketTestedBanner
          dealName={deal.name}
          onAdjust={() => console.log('[MarketTested] Adjust selected')}
          onPause={() => console.log('[MarketTested] Pause selected')}
          onWithdraw={() => console.log('[MarketTested] Withdraw selected')}
        />
      )}

      {/* ═══ TABS ═══ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="shrink-0 border-b border-border bg-main px-6 py-1.5">
          <TabsTrigger value="documents">
            <FileText size={16} />
            Documents
          </TabsTrigger>
          <TabsTrigger value="buyer-pool">
            <Users size={16} />
            Buyer Pool
          </TabsTrigger>
          <TabsTrigger value="market-intel">
            <BarChart2 size={16} />
            Market Intelligence
          </TabsTrigger>
          <TabsTrigger value="milestones">
            <Milestone size={16} />
            Stages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="flex-1 overflow-y-auto">
          <DocumentsTab
            dealName={deal.name}
            documents={documents}
            docOverrides={docOverrides}
            onUpload={handleDocUpload}
            onView={setViewingDoc}
          />
        </TabsContent>
        <TabsContent value="buyer-pool" className="flex-1 overflow-y-auto">
          <BuyerPoolTab buyers={buyers} />
        </TabsContent>
        <TabsContent value="market-intel" className="flex-1 overflow-y-auto">
          <MarketIntelligenceTab data={marketIntel} />
        </TabsContent>
        <TabsContent value="milestones" className="flex-1 overflow-y-auto">
          <MilestonesTab milestones={milestones} />
        </TabsContent>
      </Tabs>

      {/* ═══ DOCUMENT VIEW MODAL ═══ */}
      <Dialog open={viewingDoc !== null} onOpenChange={(open) => { if (!open) setViewingDoc(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingDoc?.label}</DialogTitle>
            <DialogDescription>
              {docOverrides[viewingDoc?.label ?? '']?.fileName ?? viewingDoc?.fileName ?? 'No file'}
            </DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-4 space-y-4">
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
              <div className="text-center">
                <FileText size={32} className="mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground/60">Document preview not available in demo</p>
                <p className="text-xs text-muted-foreground/40 mt-1">
                  {viewingDoc?.type?.replace(/_/g, ' ')} · {viewingDoc?.status}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-muted/20 p-3">
                <p className="text-muted-foreground/60 mb-0.5">Status</p>
                <p className="font-medium text-foreground capitalize">{viewingDoc?.status?.replace(/_/g, ' ')}</p>
              </div>
              <div className="rounded-lg bg-muted/20 p-3">
                <p className="text-muted-foreground/60 mb-0.5">Uploaded</p>
                <p className="font-medium text-foreground">
                  {(docOverrides[viewingDoc?.label ?? '']?.uploadedAt ?? viewingDoc?.uploadedAt)
                    ? new Date(docOverrides[viewingDoc?.label ?? '']?.uploadedAt ?? viewingDoc?.uploadedAt ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'}
                </p>
              </div>
              <div className="rounded-lg bg-muted/20 p-3">
                <p className="text-muted-foreground/60 mb-0.5">Type</p>
                <p className="font-medium text-foreground capitalize">{viewingDoc?.type?.replace(/_/g, ' ')}</p>
              </div>
              <div className="rounded-lg bg-muted/20 p-3">
                <p className="text-muted-foreground/60 mb-0.5">Required</p>
                <p className="font-medium text-foreground">{viewingDoc?.required ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Tab 1: Chat ─────────────────────────────────────────────────────────────

// ── Tab 1: Documents ────────────────────────────────────────────────────────

interface DocumentsTabProps {
  dealName: string
  documents: DocumentUploadItem[]
  docOverrides: Record<string, DocOverride>
  onUpload: (docLabel: string, fileName: string) => void
  onView: (doc: DocumentUploadItem) => void
}

function DocumentsTab({ dealName, documents, docOverrides, onUpload, onView }: DocumentsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingLabelRef = useRef<string>('')

  const openFilePicker = useCallback((docLabel: string) => {
    pendingLabelRef.current = docLabel
    fileInputRef.current?.click()
  }, [])

  const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && pendingLabelRef.current) {
      onUpload(pendingLabelRef.current, file.name)
    }
    // Reset so the same file can be re-selected
    e.target.value = ''
  }, [onUpload])

  const uploaded = documents.filter((d) => d.status !== 'not_started' || docOverrides[d.label])
  const pending = documents.filter((d) => d.status === 'not_started' && !docOverrides[d.label])

  return (
    <div className="px-6 py-6 space-y-6">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />

      <h2 className="text-sm font-semibold text-foreground">
        Document Package — {dealName}
      </h2>

      {/* Uploaded Documents */}
      {uploaded.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Uploaded Documents
          </h3>
          <DocumentListGroup>
            {uploaded.map((doc) => {
              const override = docOverrides[doc.label]
              const fileName = override?.fileName ?? doc.fileName ?? ''
              const uploadedAt = override?.uploadedAt ?? doc.uploadedAt
              const dateStr = uploadedAt
                ? new Date(uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : ''

              return (
                <DocumentListItem
                  key={doc.label}
                  variant="uploaded"
                  icon={Check}
                  title={doc.label}
                  description={`${fileName} · Uploaded ${dateStr}`}
                  primaryAction={{ label: 'View', icon: Eye, onClick: () => onView(doc) }}
                  secondaryAction={{ label: 'Replace', icon: RefreshCw, onClick: () => openFilePicker(doc.label) }}
                />
              )
            })}
          </DocumentListGroup>
        </div>
      )}

      {/* Pending Documents */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Pending Documents
          </h3>
          <DocumentListGroup>
            {pending.map((doc) => (
              <DocumentListItem
                key={doc.label}
                variant="pending"
                icon={FileText}
                title={doc.label}
                primaryAction={{ label: 'Upload Document', icon: Upload, onClick: () => openFilePicker(doc.label) }}
              />
            ))}
          </DocumentListGroup>
        </div>
      )}

      <p className="text-xs italic text-muted-foreground">
        Document visibility: Seated buyers can view uploaded documents. Documents are read-only for buyers.
      </p>
    </div>
  )
}

// ── Tab 3: Buyer Pool ───────────────────────────────────────────────────────

function BuyerPoolTab({ buyers }: { buyers: BuyerPoolEntry[] }) {
  const seated = buyers.filter((b) => b.seatStatus === 'seated')
  const pending = buyers.filter((b) => b.seatStatus === 'pending')

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-foreground">Buyer Pool</h2>
        <Badge size="sm" className="border-transparent bg-mode-sell/15 text-mode-sell">
          {seated.length} of 3 Seats Filled
        </Badge>
      </div>

      {/* Seated buyers */}
      {seated.length > 0 && (
        <div className="flex flex-col gap-2">
          {seated.map((buyer) => (
            <SeatedBuyerItem
              key={buyer.id}
              label={buyer.anonymizedLabel}
              rank={buyer.aiRankPosition ?? 0}
              qualified={buyer.qualificationStatus === 'qualified'}
              score={buyer.matchScore}
              equity={buyer.equityCheckSize}
              activity={`Match score ${buyer.matchScore} · ${buyer.equityCheckSize} equity`}
            />
          ))}
        </div>
      )}

      {/* Info block */}
      <InfoCallout>
        Seat allocation is managed by your Disposition Specialist. Buyers are seated based on match quality, qualification status, and DS judgment. Maximum 3 concurrent seats.
      </InfoCallout>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Pending — {pending.length} buyer{pending.length !== 1 ? 's' : ''} waiting
          </h3>
          <div className="flex flex-col gap-2">
            {pending.map((buyer) => (
              <Item key={buyer.id} variant="muted" className="px-4 py-2.5">
                <ItemContent>
                  <ItemTitle>
                    {buyer.anonymizedLabel}
                    <Badge
                      size="sm"
                      className={cn(
                        'border-transparent',
                        buyer.qualificationStatus === 'qualified'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-amber-500/20 text-amber-400',
                      )}
                    >
                      {buyer.qualificationStatus === 'qualified' ? 'Qualified' : 'Not Qualified'}
                    </Badge>
                  </ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </div>
        </div>
      )}

      {/* Passed buyers (for market_tested deals) */}
      {buyers.filter((b) => b.seatStatus === 'passed').length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Passed — {buyers.filter((b) => b.seatStatus === 'passed').length} buyer{buyers.filter((b) => b.seatStatus === 'passed').length !== 1 ? 's' : ''}
          </h3>
          <div className="flex flex-col gap-2">
            {buyers.filter((b) => b.seatStatus === 'passed').map((buyer) => (
              <Item key={buyer.id} variant="muted" className="px-4 py-2.5">
                <ItemContent>
                  <ItemTitle>
                    {buyer.anonymizedLabel}
                    <Badge size="sm" className="border-transparent bg-red-500/20 text-red-400">
                      Passed
                    </Badge>
                  </ItemTitle>
                  {buyer.passReason && (
                    <p className="text-xs text-muted-foreground mt-0.5">{buyer.passReason}</p>
                  )}
                </ItemContent>
              </Item>
            ))}
          </div>
        </div>
      )}

      {/* Invited / Accepted pipeline (for early-stage deals) */}
      {buyers.filter((b) => b.seatStatus === 'invited' || b.seatStatus === 'accepted').length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Outreach Pipeline
          </h3>
          <div className="flex flex-col gap-2">
            {buyers.filter((b) => b.seatStatus === 'invited' || b.seatStatus === 'accepted').map((buyer) => (
              <Item key={buyer.id} variant="muted" className="px-4 py-2.5">
                <ItemContent>
                  <ItemTitle>
                    {buyer.anonymizedLabel}
                    <Badge
                      size="sm"
                      className="border-transparent bg-blue-500/20 text-blue-400"
                    >
                      {buyer.seatStatus === 'accepted' ? 'Accepted' : 'Invited'}
                    </Badge>
                  </ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {(() => {
        const events: { label: string; detail?: string; date: Date }[] = []
        for (const b of buyers) {
          if (b.accessRequestedAt) {
            events.push({
              label: `${b.anonymizedLabel} requested access`,
              date: new Date(b.accessRequestedAt),
            })
          }
          if (b.passedAt) {
            events.push({
              label: `${b.anonymizedLabel} passed`,
              detail: b.passReason,
              date: new Date(b.passedAt),
            })
          }
        }
        events.sort((a, b) => b.date.getTime() - a.date.getTime())
        if (events.length === 0) return null

        return (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Recent Activity — {events.length} event{events.length !== 1 ? 's' : ''}
            </h3>
            <div className="flex flex-col gap-2">
              {events.map((event, i) => (
                <Item key={i} variant="muted" className="px-4 py-2.5">
                  <ItemContent>
                    <ItemTitle className="text-xs font-normal">
                      <Clock size={14} className="shrink-0 text-muted-foreground" />
                      {event.label}
                    </ItemTitle>
                    {event.detail && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.detail}</p>
                    )}
                  </ItemContent>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatRelativeTime(event.date.toISOString())}
                  </span>
                </Item>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ── Tab 4: Market Intelligence ──────────────────────────────────────────────

function MarketIntelligenceTab({ data }: { data?: MarketIntelData }) {
  if (!data) return null

  return (
    <div className="px-6 py-6 space-y-6">
      <h2 className="text-sm font-semibold text-foreground">Market Intelligence</h2>

      {/* Stat tiles */}
      <StatTileGrid className="sm:grid-cols-3 lg:grid-cols-5">
        {data.stats.map((stat) => (
          <StatTile key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </StatTileGrid>

      {/* Pass Reason Breakdown */}
      {data.passReasons.length > 0 && (
        <SummaryCard title="Pass Reason Breakdown">
          <div className="space-y-2.5">
            {data.passReasons.map((item) => (
              <BarChartRow
                key={item.reason}
                label={item.reason}
                value={item.count}
                percentage={item.pct}
              />
            ))}
          </div>
        </SummaryCard>
      )}

      {/* Market Intelligence Summary */}
      <SummaryCard title="Market Intelligence Summary" badge={data.summaryBadge}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {data.summary}
        </p>
      </SummaryCard>
    </div>
  )
}

// ── Tab 5: Milestones ───────────────────────────────────────────────────────

function MilestonesTab({ milestones }: { milestones: MilestoneItem[] }) {
  return (
    <div className="px-6 py-6 space-y-6">
      <h2 className="text-sm font-semibold text-foreground">Deal Milestones</h2>

      {/* 9-stage timeline */}
      <div className="rounded-xl border border-border bg-background p-5">
        <MilestoneTimeline items={milestones} />
      </div>

      {/* Post-acceptance milestones (locked) */}
      <div className="rounded-xl border border-border bg-background p-5 space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Post-Acceptance Milestones
        </h3>
        <div className="space-y-1">
          {POST_ACCEPTANCE_LABELS.map((milestone) => (
            <div
              key={milestone}
              className="flex items-center gap-3 rounded-lg bg-muted/20 px-4 py-2"
            >
              <Lock size={13} className="text-muted-foreground/30" />
              <span className="text-xs text-muted-foreground/40">{milestone}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
