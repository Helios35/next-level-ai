import type { BuyerStrategy } from '@shared/types/buyerStrategy'

export const MOCK_BUYER_STRATEGIES: BuyerStrategy[] = [
  {
    id: 'bs_001',
    userId: 'user_buyer_001',
    name: 'Phoenix BFR Portfolio',
    assetType: 'residential',
    assetSubType: 'bfr',
    sharedCriteria: {
      geography: 'Phoenix-Mesa-Chandler, AZ',
      dealSizeMin: 5000000,
      dealSizeMax: 25000000,
    },
    uniqueCriteria: {
      unitCountMin: 50,
      unitCountMax: 200,
      deliveryTimeline: 'stabilized',
    },
    status: 'broadcasting',
    matchCount: 14,
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-04-01T09:00:00Z',
  },
  {
    id: 'bs_002',
    userId: 'user_buyer_001',
    name: 'Sunbelt Multifamily',
    assetType: 'residential',
    assetSubType: 'multifamily',
    sharedCriteria: {
      geography: 'Dallas-Fort Worth-Arlington, TX',
      dealSizeMin: 10000000,
      dealSizeMax: 50000000,
    },
    uniqueCriteria: {
      unitCountMin: 100,
      unitCountMax: 400,
      classType: 'B',
    },
    status: 'paused',
    matchCount: 6,
    createdAt: '2026-02-20T14:00:00Z',
    updatedAt: '2026-03-28T11:00:00Z',
  },
]
