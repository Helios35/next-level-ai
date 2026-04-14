import type { InternalUser } from '@shared/types/internalUser'

export const MOCK_INTERNAL_USERS: InternalUser[] = [
  {
    id: 'internal_001',
    name: 'Rachel Torres',
    email: 'rachel.torres@nextlevel.io',
    role: 'ds',
    status: 'active',
    lastLogin: '2026-04-14T08:22:00Z',
  },
  {
    id: 'internal_002',
    name: 'David Chen',
    email: 'david.chen@nextlevel.io',
    role: 'analyst',
    status: 'active',
    lastLogin: '2026-04-13T17:45:00Z',
  },
  {
    id: 'internal_003',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@nextlevel.io',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-04-14T09:10:00Z',
  },
]
