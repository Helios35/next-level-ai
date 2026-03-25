import type { UserRole } from './enums'

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
