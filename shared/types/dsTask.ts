import type { AssetSubType } from './enums'

export type DsTaskType =
  | 'seat_approval'
  | 'seat_approval_invited'
  | 'offer_feedback_authorization'
  | 'pricing_guidance_authorization'
  | 'buyer_outreach_authorization'
  | 'seller_escalation'
  | 'buyer_qa_escalation'
  | 'listing_agreement'
  | 'milestone_logging'
  | 'market_tested_declaration'

export type DsTaskUrgency = 'action_required' | 'review_pending' | 'informational'

export type DsTaskTargetTab =
  | 'overview'
  | 'seat_allocation'
  | 'offer_rounds'
  | 'documents'
  | 'market_intelligence'
  | 'milestones'
  | 'messages'

export interface DsTask {
  id: string
  dealId: string
  dealName: string
  assetSubtype: AssetSubType
  geography: string
  urgency: DsTaskUrgency
  type: DsTaskType
  createdAt: string
  targetTab: DsTaskTargetTab
}
