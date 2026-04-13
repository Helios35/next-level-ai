// Question classification for agent_buyer Mode A deal room Q&A
export type QuestionCategory =
  | 'doc_answerable'       // AI answers from deal documents
  | 'platform_mechanics'   // AI answers from authored static content
  | 'ds_escalation'        // Routes to DS queue
  | 'hard_block'           // AI declines directly, no escalation

// Buyer agent modes — Mode D (activation) added to existing A/B/C
export type BuyerAgentMode = 'qa' | 'outreach' | 'intent' | 'activation'

// Intent capture signal collected during activation conversation Phase 1
export interface IntentCaptureSignal {
  dimension: 'asset_type' | 'geography' | 'deal_size' | 'timeline' | 'capital_readiness' | 'experience'
  value: string
  strength: 'strong' | 'soft'
}

// Context for agent_buyer Mode D — post-signup activation conversation
export interface BuyerActivationContext {
  userId: string
  userName: string
  accountRole: 'principal' | 'broker'
  intentSignals: IntentCaptureSignal[]
  intentRating: 'high' | 'medium' | 'low'
  strategyDraft: Record<string, unknown>
  strategyId?: string
  qualificationStarted: boolean
  qualificationComplete: boolean
}
