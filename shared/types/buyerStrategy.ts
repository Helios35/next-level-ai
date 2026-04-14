import type { StrategyStatus } from './enums'

export type BuyerStrategyStatus = StrategyStatus

// CTA state for a buyer on a specific deal
// Drives DealCard and DealPreviewModal buyer-mode behavior
export type BuyerCtaState =
  | 'coming_soon'       // Deal is Stage 6 — indicate interest only
  | 'request_access'    // Deal is Stage 7 — buyer has not yet requested
  | 'access_pending'    // Request submitted, awaiting DS decision
  | 'wait_queue'        // DS denied seat — buyer is in wait queue
  | 'enter_deal_room'   // Buyer is seated — can enter

export interface BuyerStrategy {
  id: string
  userId: string
  name: string
  assetType: string
  assetSubType: string
  sharedCriteria: Record<string, unknown>
  uniqueCriteria: Record<string, unknown>
  optionalCriteria?: Record<string, unknown>
  status: BuyerStrategyStatus
  matchCount: number
  activeDealRoomCount: number
  activeDealRoomIds?: string[]
  createdAt: string
  updatedAt: string
}
