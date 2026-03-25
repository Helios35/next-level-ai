export type ChatSenderRole =
  | 'ai_agent'
  | 'seller'
  | 'buyer'
  | 'ds'
  | 'system'

export type ChatMessageType = 'message' | 'stage_update' | 'question_routed' | 'feedback'

export interface ChatMessage {
  id: string
  dealRoomId: string
  senderId: string
  senderRole: ChatSenderRole
  senderLabel: string
  content: string
  messageType: ChatMessageType
  timestamp: string
  isAiHandoff?: boolean
  routedQuestionId?: string
}

export interface BuyerFeedbackItem {
  id: string
  dealRoomId: string
  buyerAnonymizedLabel: string
  question: string
  status: 'pending_seller' | 'answered' | 'unanswered'
  sellerResponse?: string
  submittedAt: string
  answeredAt?: string
}
