import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type ClientType = 'buyer' | 'seller'
type ClientFilter = 'all' | 'buyers' | 'sellers'

interface ClientRecord {
  id: string
  name: string
  email: string
  type: ClientType
  qualificationStatus?: 'qualified' | 'not_qualified'
  activeDeals: number
  joinedDate: string
  accountStatus: 'active' | 'suspended'
}

const MOCK_CLIENTS: ClientRecord[] = [
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface AdminClientsProps {
  onNavigateToClient: (clientId: string) => void
}

export default function AdminClients({ onNavigateToClient }: AdminClientsProps) {
  const [filter, setFilter] = useState<ClientFilter>('all')

  const filtered = useMemo(() => {
    if (filter === 'buyers') return MOCK_CLIENTS.filter((c) => c.type === 'buyer')
    if (filter === 'sellers') return MOCK_CLIENTS.filter((c) => c.type === 'seller')
    return MOCK_CLIENTS
  }, [filter])

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Clients</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All buyer and seller accounts on the platform.
        </p>
      </div>

      <div className="mb-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as ClientFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
            <TabsTrigger value="sellers">Sellers</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              {filter !== 'sellers' && (
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Qualification</th>
              )}
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Active Deals</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr
                key={client.id}
                className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/30"
                onClick={() => onNavigateToClient(client.id)}
              >
                <td className="px-4 py-3 font-medium text-foreground">{client.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{client.email}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={
                      client.type === 'buyer'
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    }
                  >
                    {client.type === 'buyer' ? 'Buyer' : 'Seller'}
                  </Badge>
                </td>
                {filter !== 'sellers' && (
                  <td className="px-4 py-3 text-muted-foreground">
                    {client.type === 'buyer' ? (
                      <Badge
                        variant="outline"
                        className={
                          client.qualificationStatus === 'qualified'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                        }
                      >
                        {client.qualificationStatus === 'qualified' ? 'Qualified' : 'Unqualified'}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 text-muted-foreground">{client.activeDeals}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(client.joinedDate)}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={
                      client.accountStatus === 'active'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-red-500/30 bg-red-500/10 text-red-400'
                    }
                  >
                    {client.accountStatus === 'active' ? 'Active' : 'Suspended'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Re-export the mock data for use in AdminClientProfile
export { MOCK_CLIENTS }
export type { ClientRecord }
