export type FinancingType = 'cash' | 'financed'

export interface Offer {
  id: string
  dealRoomId: string
  buyerId: string
  amount: number
  financingType: FinancingType
  closingTimelineDays: number
  earnestMoneyAmount: number
  terms: string
  round: 1 | 2 | 3
  submittedAt: string
}
