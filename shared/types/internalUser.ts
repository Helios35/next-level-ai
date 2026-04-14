import type { InternalRole } from './enums'

export interface InternalUser {
  id: string
  name: string
  email: string
  role: InternalRole
  status: 'active' | 'inactive'
  lastLogin: string
}
