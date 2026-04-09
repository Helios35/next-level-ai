import { useState } from 'react'
import { Check, Eye, FileText, Send } from 'lucide-react'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { MOCK_DOCUMENTS_DR001, MOCK_DOCUMENTS_DR002, MOCK_DOCUMENTS_DR005 } from '@/data/mock/documents'
import { MOCK_BUYER_POOL_DR001, MOCK_BUYER_POOL_DR005 } from '@/data/mock/buyerPool'
import { MOCK_CHAT_BUYER_DR001 } from '@/data/mock/chat'
import type { DealDocument } from '@shared/types/document'
import type { BuyerPoolEntry } from '@shared/types/buyerPool'
import type { Offer } from '@shared/types/offer'
import DealRoomHeader from '@/components/DealRoomHeader'
import StageProgressBar from '@/components/StageProgressBar'
import BuyerPoolPanel from '@/components/BuyerPoolPanel'
import OfferSubmissionForm from '@/components/OfferSubmissionForm'
import { SectionCard } from '@/components/ui/section-card'
import { DocumentListItem, DocumentListGroup } from '@/components/ui/document-list-item'
import { Button } from '@/components/ui/button'

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

// ── Currency formatter ────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)

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

  // Offer state
  const [offerFormOpen, setOfferFormOpen] = useState(false)
  const [currentOffer, setCurrentOffer] = useState<Offer | undefined>(undefined)

  const handleOfferSubmit = (data: Partial<Offer>) => {
    setCurrentOffer({
      id: currentOffer?.id ?? crypto.randomUUID(),
      dealRoomId: dealId,
      buyerId: 'mock-buyer-id',
      submittedAt: new Date().toISOString(),
      round: 1,
      amount: 0,
      financingType: 'cash',
      closingTimelineDays: 30,
      earnestMoneyAmount: 0,
      terms: '',
      ...currentOffer,
      ...data,
    } as Offer)
  }

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

        {/* Section 4 — Offer Round (visible only at Stage 8) */}
        {deal.currentStage >= 8 && (
          <SectionCard icon={Send} iconClassName="text-mode-buy" title="Offer Round">
            <div className="space-y-4">
              {/* Round status */}
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-foreground">Round 1 of 3</p>
                <p className="text-xs text-muted-foreground">Closes in 36 hours</p>
              </div>

              {/* Buyer's own offer display */}
              {currentOffer ? (
                <>
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Offer</p>

                    <p className="text-2xl font-bold text-foreground">{formatCurrency(currentOffer.amount)}</p>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Earnest Money</p>
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(currentOffer.earnestMoneyAmount)}</p>
                        <p className="text-xs text-muted-foreground">3% of offer</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Close In</p>
                        <p className="text-sm font-semibold text-foreground">{currentOffer.closingTimelineDays} days</p>
                        <p className="text-xs text-muted-foreground">{currentOffer.closingTimelineDays === 30 ? 'Standard' : 'Custom'}</p>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Financing</span>
                      <span className="font-medium text-foreground">{currentOffer.financingType === 'cash' ? 'Cash' : 'Financed'}</span>
                    </div>

                    {currentOffer.terms ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Notes</span>
                        <span className="font-medium text-foreground truncate max-w-[60%] text-right">{currentOffer.terms}</span>
                      </div>
                    ) : null}
                  </div>

                  <Button
                    className="w-full bg-mode-buy text-white hover:bg-mode-buy/80"
                    onClick={() => setOfferFormOpen(true)}
                  >
                    Update Offer
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full bg-mode-buy text-white hover:bg-mode-buy/80"
                  onClick={() => setOfferFormOpen(true)}
                >
                  Submit Offer
                </Button>
              )}
            </div>
          </SectionCard>
        )}

        {/* Offer form sheet */}
        <OfferSubmissionForm
          open={offerFormOpen}
          onOpenChange={setOfferFormOpen}
          dealRoomId={dealId}
          round={1}
          existingOffer={currentOffer}
          onSubmit={handleOfferSubmit}
        />
      </div>
    </div>
  )
}
