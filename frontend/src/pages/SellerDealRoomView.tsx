import { cn } from '@/utils/cn'
import {
  FileText, Users, BarChart2, Milestone,
  Upload, Check, Eye, RefreshCw, Lock,

} from 'lucide-react'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import DealRoomHeader from '@/components/DealRoomHeader'
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
import type { DealRoomStage } from '@shared/types/enums'

const DEFAULT_DEAL = MOCK_SELLER_DEAL_ROOMS.find((d) => d.id === 'dr_001')!

// ── Tab definitions ─────────────────────────────────────────────────────────

// ── Hardcoded data for tabs ─────────────────────────────────────────────────
// TODO: move to mock data

// Exported for use in AppShell's persistent AI chat panel when viewing this deal room
export const DEAL_ROOM_CHAT_MESSAGES = [
  {
    role: 'ai' as const,
    sender: 'NextLevel AI',
    text: "Good morning. I've completed the initial outreach round for Magnolia Farms. All 3 buyer seats are filled. Buyer #2041 opened the deal room yesterday and has already submitted 4 questions — I've answered 3 directly from the documents and routed 1 to your DS for a pricing-adjacent response.",
    time: 'Feb 28, 9:02 AM',
  },
  {
    role: 'seller' as const,
    sender: 'You',
    text: 'Thanks. Any feedback on the price range so far?',
    time: 'Feb 28, 9:15 AM',
  },
  {
    role: 'ai' as const,
    sender: 'NextLevel AI',
    text: "Not yet — it's early. The seated buyers haven't passed or commented on pricing. Buyer #2041 asked a question I've flagged as pricing-adjacent and routed to your DS. I'll surface a market intelligence summary once we have at least one pass reason on record.",
    time: 'Feb 28, 9:15 AM',
  },
  {
    role: 'ai' as const,
    sender: 'NextLevel AI',
    text: "Update: Buyer #2038 has been active in the deal room for 3 days. No offer submitted yet. Buyer #2041 opened the offer form earlier today — I've notified your DS. No offer submitted yet, just awareness.",
    time: 'Mar 1, 8:44 AM',
  },
  {
    role: 'seller' as const,
    sender: 'You',
    text: 'Got it. How many buyers have reviewed the documents?',
    time: 'Mar 1, 9:00 AM',
  },
  {
    role: 'ai' as const,
    sender: 'NextLevel AI',
    text: "All 3 seated buyers have opened the deal room. 2 of 3 have opened the document folder. I'll keep you updated as activity progresses. No action needed from you at this stage.",
    time: 'Mar 1, 9:00 AM',
  },
]

const REQUIRED_DOCS = [
  { name: 'Rent Roll', status: 'uploaded', date: 'Feb 18, 2026', file: 'MagnoliaFarms_RentRoll_Feb2026.xlsx' },
  { name: 'T12 / 12-Month Income Report', status: 'uploaded', date: 'Feb 18, 2026', file: 'MagnoliaFarms_T12_2025.pdf' },
]

const OPTIONAL_DOCS = [
  'Site / Community Plan',
  'Construction Schedule',
  'Budget / GMP Summary',
  'Sample Leases',
]

const SEATED_BUYERS = [
  { label: 'Investor #2041', qualified: true, score: 94, equity: '$5M–$15M', activity: 'Opened deal room \u00B7 3 docs viewed \u00B7 4 questions asked', rank: 1 },
  { label: 'Investor #2038', qualified: true, score: 88, equity: '$3M–$10M', activity: 'Opened deal room \u00B7 2 docs viewed \u00B7 1 question asked', rank: 2 },
  { label: 'Investor #2029', qualified: true, score: 79, equity: '$8M–$20M', activity: 'Opened deal room \u00B7 0 docs viewed \u00B7 0 questions', rank: 3 },
]

const WAIT_QUEUE = [
  { label: 'Investor #2051', qualified: true },
  { label: 'Investor #2019', qualified: false },
]

const MARKET_STATS = [
  { label: 'Buyers Invited', value: 14 },
  { label: 'Buyers Who Opened Deal Room', value: 3 },
  { label: 'Buyers Who Passed', value: 8 },
  { label: 'Information Requests', value: 7 },
  { label: 'Offers Submitted', value: 0 },
]

const PASS_REASONS = [
  { reason: 'Pricing', count: 3, pct: 37.5 },
  { reason: 'Strategy Fit', count: 2, pct: 25 },
  { reason: 'Location', count: 1, pct: 12.5 },
  { reason: 'Need More Information', count: 1, pct: 12.5 },
  { reason: 'Other', count: 1, pct: 12.5 },
]

const MILESTONE_DATA: { stage: DealRoomStage; status: 'complete' | 'current' | 'upcoming'; date?: string }[] = [
  { stage: 1, status: 'complete', date: 'Jan 16, 2026' },
  { stage: 2, status: 'complete', date: 'Jan 22, 2026' },
  { stage: 3, status: 'complete', date: 'Jan 24, 2026' },
  { stage: 4, status: 'complete', date: 'Jan 27, 2026' },
  { stage: 5, status: 'complete', date: 'Jan 29, 2026' },
  { stage: 6, status: 'complete', date: 'Feb 3, 2026' },
  { stage: 7, status: 'current', date: 'Started Feb 3, 2026' },
  { stage: 8, status: 'upcoming' },
  { stage: 9, status: 'upcoming' },
]

const POST_ACCEPTANCE = [
  'PSA Executed',
  'Earnest Money Received',
  'Due Diligence Complete',
  'Financing Confirmed',
  'Closed',
]

// ── Component ───────────────────────────────────────────────────────────────

interface SellerDealRoomViewProps {
  dealId?: string
  onBack?: () => void
}

export default function SellerDealRoomView({ dealId, onBack }: SellerDealRoomViewProps) {
  const deal = dealId
    ? MOCK_SELLER_DEAL_ROOMS.find((d) => d.id === dealId) ?? DEFAULT_DEAL
    : DEFAULT_DEAL
  return (
    <div className="flex h-full flex-col">
      {/* ═══ DEAL HEADER ═══ */}
      <DealRoomHeader deal={deal} onBack={onBack} />

      {/* ═══ TABS ═══ */}
      <Tabs defaultValue="documents" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="shrink-0 border-b border-border bg-background px-6 py-1.5">
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
            Milestones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="flex-1 overflow-y-auto">
          <DocumentsTab />
        </TabsContent>
        <TabsContent value="buyer-pool" className="flex-1 overflow-y-auto">
          <BuyerPoolTab />
        </TabsContent>
        <TabsContent value="market-intel" className="flex-1 overflow-y-auto">
          <MarketIntelligenceTab />
        </TabsContent>
        <TabsContent value="milestones" className="flex-1 overflow-y-auto">
          <MilestonesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ── Tab 1: Chat ─────────────────────────────────────────────────────────────

// ── Tab 1: Documents ────────────────────────────────────────────────────────

function DocumentsTab() {
  return (
    <div className="px-6 py-6 space-y-6">
      <h2 className="text-sm font-semibold text-foreground">
        Document Package — Magnolia Farms BFR
      </h2>

      {/* Required Documents */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Required Documents
        </h3>
        <DocumentListGroup>
          {REQUIRED_DOCS.map((doc, i) => (
            <DocumentListItem
              key={i}
              variant="uploaded"
              icon={Check}
              title={doc.name}
              description={`${doc.file} \u00B7 Uploaded ${doc.date}`}
              primaryAction={{ label: 'View', icon: Eye }}
              secondaryAction={{ label: 'Replace', icon: RefreshCw }}
            />
          ))}
        </DocumentListGroup>
      </div>

      {/* Optional Documents */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Optional Documents
        </h3>
        <DocumentListGroup>
          {OPTIONAL_DOCS.map((name, i) => (
            <DocumentListItem
              key={i}
              variant="pending"
              icon={FileText}
              title={name}
              primaryAction={{ label: 'Upload Document', icon: Upload }}
            />
          ))}
        </DocumentListGroup>
      </div>

      <p className="text-xs italic text-muted-foreground">
        Document visibility: Seated buyers can view uploaded documents. Documents are read-only for buyers.
      </p>
    </div>
  )
}

// ── Tab 3: Buyer Pool ───────────────────────────────────────────────────────

function BuyerPoolTab() {
  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-foreground">Buyer Pool</h2>
        <Badge size="sm" className="border-transparent bg-mode-sell/15 text-mode-sell">
          3 of 3 Seats Filled
        </Badge>
      </div>

      {/* Seated buyers */}
      <div className="flex flex-col gap-2">
        {SEATED_BUYERS.map((buyer) => (
          <SeatedBuyerItem
            key={buyer.label}
            label={buyer.label}
            rank={buyer.rank}
            qualified={buyer.qualified}
            score={buyer.score}
            equity={buyer.equity}
            activity={buyer.activity}
          />
        ))}
      </div>

      {/* Info block */}
      <InfoCallout>
        Seat allocation is managed by your Disposition Specialist. Buyers are seated based on match quality, qualification status, and DS judgment. Maximum 3 concurrent seats.
      </InfoCallout>

      {/* Wait Queue */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Wait Queue — 2 buyers waiting
        </h3>
        <div className="flex flex-col gap-2">
          {WAIT_QUEUE.map((buyer) => (
            <Item key={buyer.label} variant="muted" className="px-4 py-2.5">
              <ItemContent>
                <ItemTitle>
                  {buyer.label}
                  <Badge
                    size="sm"
                    className={cn(
                      'border-transparent',
                      buyer.qualified
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-amber-500/20 text-amber-400',
                    )}
                  >
                    {buyer.qualified ? 'Qualified' : 'Unqualified'}
                  </Badge>
                </ItemTitle>
              </ItemContent>
            </Item>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tab 4: Market Intelligence ──────────────────────────────────────────────

function MarketIntelligenceTab() {
  return (
    <div className="px-6 py-6 space-y-6">
      <h2 className="text-sm font-semibold text-foreground">Market Intelligence</h2>

      {/* Stat tiles */}
      <StatTileGrid className="sm:grid-cols-3 lg:grid-cols-5">
        {MARKET_STATS.map((stat) => (
          <StatTile key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </StatTileGrid>

      {/* Pass Reason Breakdown */}
      <SummaryCard title="Pass Reason Breakdown">
        <div className="space-y-2.5">
          {PASS_REASONS.map((item) => (
            <BarChartRow
              key={item.reason}
              label={item.reason}
              value={item.count}
              percentage={item.pct}
            />
          ))}
        </div>
      </SummaryCard>

      {/* Market Intelligence Summary */}
      <SummaryCard title="Market Intelligence Summary" badge="DS Authored">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Early buyer activity is positive. 3 of 14 invited buyers converted to seated — a healthy conversion rate for this price range. The primary friction point is pricing: 3 of 8 pass reasons cited pricing as the barrier. DS note: The $14M–$18M range may be slightly above where initial demand is concentrating. Recommend holding current range through the first offer round before advising seller on adjustment.
        </p>
      </SummaryCard>
    </div>
  )
}

// ── Tab 5: Milestones ───────────────────────────────────────────────────────

function MilestonesTab() {
  return (
    <div className="px-6 py-6 space-y-6">
      <h2 className="text-sm font-semibold text-foreground">Deal Milestones</h2>

      {/* 9-stage timeline */}
      <div className="rounded-xl border border-border bg-background p-5">
        <MilestoneTimeline items={MILESTONE_DATA} />
      </div>

      {/* Post-acceptance milestones (locked) */}
      <div className="rounded-xl border border-border bg-background p-5 space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Post-Acceptance Milestones
        </h3>
        <div className="space-y-1">
          {POST_ACCEPTANCE.map((milestone) => (
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
