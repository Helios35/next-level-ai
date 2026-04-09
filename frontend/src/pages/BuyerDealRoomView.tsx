import { Check, Eye, FileText, Send } from 'lucide-react'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { MOCK_DOCUMENTS_DR001, MOCK_DOCUMENTS_DR002, MOCK_DOCUMENTS_DR005 } from '@/data/mock/documents'
import { MOCK_BUYER_POOL_DR001, MOCK_BUYER_POOL_DR005 } from '@/data/mock/buyerPool'
import { MOCK_CHAT_BUYER_DR001 } from '@/data/mock/chat'
import type { DealDocument } from '@shared/types/document'
import type { BuyerPoolEntry } from '@shared/types/buyerPool'
import DealRoomHeader from '@/components/DealRoomHeader'
import StageProgressBar from '@/components/StageProgressBar'
import BuyerPoolPanel from '@/components/BuyerPoolPanel'
import { SectionCard } from '@/components/ui/section-card'
import { DocumentListItem, DocumentListGroup } from '@/components/ui/document-list-item'

// ── Mock data lookups by dealId ────────────────────────────────────────────

const DOCUMENTS_BY_DEAL: Record<string, DealDocument[]> = {
  dr_001: MOCK_DOCUMENTS_DR001,
  dr_002: MOCK_DOCUMENTS_DR002,
  dr_005: MOCK_DOCUMENTS_DR005,
}

const BUYER_POOL_BY_DEAL: Record<string, BuyerPoolEntry[]> = {
  dr_001: MOCK_BUYER_POOL_DR001,
  dr_005: MOCK_BUYER_POOL_DR005,
}

// ── Exported chat messages for ShellDemo wiring ────────────────────────────

export const BUYER_DEAL_ROOM_CHAT = MOCK_CHAT_BUYER_DR001

// ── Component ──────────────────────────────────────────────────────────────

interface BuyerDealRoomViewProps {
  dealId: string
  onBack: () => void
}

export default function BuyerDealRoomView({ dealId, onBack }: BuyerDealRoomViewProps) {
  const deal = MOCK_SELLER_DEAL_ROOMS.find((d) => d.id === dealId) ?? MOCK_SELLER_DEAL_ROOMS[0]
  const documents = DOCUMENTS_BY_DEAL[dealId] ?? []
  const buyers = BUYER_POOL_BY_DEAL[dealId] ?? []

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Section 1 — Header + Stage Bar */}
      <DealRoomHeader deal={deal} viewer="buyer" onBack={onBack} />
      <div className="px-6 py-4 border-b border-border bg-main">
        <StageProgressBar currentStage={deal.currentStage} buyerView />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Section 2 — Document Package (read-only) */}
        <SectionCard icon={FileText} iconClassName="text-mode-buy" title="Document Package">
          <DocumentListGroup>
            {documents.map((doc) => (
              <DocumentListItem
                key={doc.id}
                variant="uploaded"
                icon={Check}
                title={doc.label}
                description={doc.fileName}
                primaryAction={{ label: 'View', icon: Eye }}
              />
            ))}
          </DocumentListGroup>
        </SectionCard>

        {/* Section 3 — Buyer Pool Panel */}
        <BuyerPoolPanel buyers={buyers} />

        {/* Section 4 — Offer Placeholder */}
        <SectionCard icon={Send} iconClassName="text-mode-buy" title="Submit Offer" disabled>
          <p className="text-sm text-muted-foreground">
            Offer section coming in Sprint B-5.
          </p>
        </SectionCard>
      </div>
    </div>
  )
}
