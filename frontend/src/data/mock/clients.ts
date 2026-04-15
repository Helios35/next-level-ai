// Shared mock clients — consumed by Admin and Analyst client directories.

export type ClientType = 'buyer' | 'seller'

export interface ClientRecord {
  id: string
  name: string
  email: string
  type: ClientType
  qualificationStatus?: 'qualified' | 'not_qualified'
  activeDeals: number
  joinedDate: string
  accountStatus: 'active' | 'suspended'
}

export const MOCK_CLIENTS: ClientRecord[] = [
  {
    id: 'client_001',
    name: 'Nathan Ivy',
    email: 'nathan@example.com',
    type: 'seller',
    activeDeals: 2,
    joinedDate: '2026-01-10T10:00:00Z',
    accountStatus: 'active',
  },
  {
    id: 'client_002',
    name: 'Marcus Webb',
    email: 'marcus@example.com',
    type: 'seller',
    activeDeals: 1,
    joinedDate: '2026-02-05T10:00:00Z',
    accountStatus: 'active',
  },
  {
    id: 'client_003',
    name: 'Apex Capital Partners',
    email: 'deals@apexcapital.com',
    type: 'buyer',
    qualificationStatus: 'qualified',
    activeDeals: 3,
    joinedDate: '2026-01-15T10:00:00Z',
    accountStatus: 'active',
  },
  {
    id: 'client_004',
    name: 'Greenfield Acquisitions',
    email: 'info@greenfield.com',
    type: 'buyer',
    qualificationStatus: 'qualified',
    activeDeals: 1,
    joinedDate: '2026-01-20T10:00:00Z',
    accountStatus: 'active',
  },
  {
    id: 'client_005',
    name: 'Blue Ridge Residential',
    email: 'contact@blueridgeres.com',
    type: 'buyer',
    qualificationStatus: 'not_qualified',
    activeDeals: 0,
    joinedDate: '2026-03-01T10:00:00Z',
    accountStatus: 'active',
  },
  {
    id: 'client_006',
    name: 'Rebecca Collins',
    email: 'rcollins@example.com',
    type: 'seller',
    activeDeals: 1,
    joinedDate: '2026-02-28T10:00:00Z',
    accountStatus: 'suspended',
  },
]
