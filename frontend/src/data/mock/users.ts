import type { User, SellerPerformance } from '@shared/types/user'

export const MOCK_CURRENT_USER: User = {
  id: 'user_001',
  name: 'Marcus Webb',
  email: 'marcus.webb@trianglecap.com',
  company: 'Triangle Capital Group',
  role: 'principal',
  brokerFlag: false,
  phone: '(704) 555-0192',
  location: 'Charlotte, NC',
  avatarInitials: 'MW',
  qualificationComplete: true,
  createdAt: '2026-01-14T10:00:00Z',
  ownerSourceType: 'direct',
  sourceId: null,
}

export const MOCK_SELLER_PERFORMANCE: SellerPerformance = {
  dealRoomsOpen: 2,
  disposStarted: 1,
  dealsCanceled: 0,
  dealsClosed: 0,
}

export const MOCK_SOURCED_SELLER_USERS: User[] = [
  {
    id: 'user_010',
    name: 'Carol Tran',
    email: 'carol.tran@landmarkdev.com',
    company: 'Landmark Development',
    role: 'seller',
    brokerFlag: false,
    avatarInitials: 'CT',
    qualificationComplete: false,
    createdAt: '2026-01-20T10:00:00Z',
    ownerSourceType: 'sourced',
    sourceId: 'src_001',
  },
  {
    id: 'user_011',
    name: 'Brian Okafor',
    email: 'b.okafor@pinecresthomes.com',
    company: 'Pinecrest Homes',
    role: 'seller',
    brokerFlag: false,
    avatarInitials: 'BO',
    qualificationComplete: false,
    createdAt: '2026-02-05T09:00:00Z',
    ownerSourceType: 'sourced',
    sourceId: 'src_002',
  },
]
