import type { SourcePartyType } from './enums'

export interface Source {
  id: string                        // e.g. 'src_001'
  name: string                      // person name
  company: string                   // firm name
  email: string                     // contact email
  sourcePartyType: SourcePartyType  // 'md' | 'broker' | 'partner'
  uniqueLinkToken: string           // the ?src= value
  generatedLink: string             // full signup URL with token
  createdAt: string                 // ISO date string
  createdByAdminId: string          // ID of Admin who created the record
  isActive: boolean                 // soft disable without deleting
}
