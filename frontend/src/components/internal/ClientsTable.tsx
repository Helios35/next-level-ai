import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/breadcrumbs'
import { MOCK_CLIENTS, type ClientRecord } from '@/data/mock/clients'

type ClientFilter = 'all' | 'buyers' | 'sellers'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface ClientsTableProps {
  title?: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  /** When true, rows are still clickable but the table has a read-only affordance */
  readOnly?: boolean
  /** Called when a client row is clicked. If omitted, rows are not clickable. */
  onNavigateToClient?: (clientId: string) => void
  /** Override the data source — defaults to MOCK_CLIENTS */
  clients?: ClientRecord[]
}

export default function ClientsTable({
  title = 'Clients',
  subtitle = 'All buyer and seller accounts on the platform.',
  breadcrumbs,
  readOnly = false,
  onNavigateToClient,
  clients = MOCK_CLIENTS,
}: ClientsTableProps) {
  const [filter, setFilter] = useState<ClientFilter>('all')

  const filtered = useMemo(() => {
    if (filter === 'buyers') return clients.filter((c) => c.type === 'buyer')
    if (filter === 'sellers') return clients.filter((c) => c.type === 'seller')
    return clients
  }, [filter, clients])

  const rowClickable = !!onNavigateToClient

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs className="mb-4" items={breadcrumbs} />
      )}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {subtitle}
          {readOnly && (
            <span className="ml-2 text-xs italic text-muted-foreground/70">
              (read-only)
            </span>
          )}
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Qualification
                </th>
              )}
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Active Deals
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr
                key={client.id}
                className={
                  'border-b border-border last:border-0 ' +
                  (rowClickable ? 'cursor-pointer hover:bg-muted/30' : '')
                }
                onClick={() => rowClickable && onNavigateToClient?.(client.id)}
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
                        {client.qualificationStatus === 'qualified'
                          ? 'Qualified'
                          : 'Unqualified'}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 text-muted-foreground">{client.activeDeals}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(client.joinedDate)}
                </td>
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
