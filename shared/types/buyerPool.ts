import type { QualificationStatus, SeatStatus, OutreachStatus } from './enums'

export interface BuyerPoolEntry {
  id: string
  dealRoomId: string
  buyerId: string
  anonymizedLabel: string
  isCurrentUser: boolean
  qualificationStatus: QualificationStatus
  seatStatus: SeatStatus
  outreachStatus: OutreachStatus
  matchScore: number
  equityCheckSize: string
  accessRequestedAt?: string
  seatedAt?: string
  passedAt?: string
  passReason?: string
  aiRankPosition?: number
  dsOverrideRank?: number
}
