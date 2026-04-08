import type { UserRole, OwnerSourceType } from './enums'

export interface User {
  id: string
  name: string
  email: string
  company: string
  role: UserRole
  brokerFlag: boolean
  phone?: string
  location?: string
  avatarInitials: string
  qualificationComplete: boolean
  createdAt: string

  // SOURCE ATTRIBUTION — added in Source Attribution Sprint
  ownerSourceType: OwnerSourceType    // 'direct' | 'sourced' — always set, never null
  sourceId: string | null             // FK to sources table — null if ownerSourceType is 'direct'
}

export interface BuyerPerformance {
  dealRoomsAccessed: number
  offersMade: number
  dealsWon: number
}

export interface SellerPerformance {
  dealRoomsOpen: number
  disposStarted: number
  dealsCanceled: number
  dealsClosed: number
}
