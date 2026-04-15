import ClientsTable from '@/components/internal/ClientsTable'

/**
 * Analyst clients — read-only directory.
 *
 * Analysts have no direct client contact per the business rules, but need
 * context on sellers and buyers when reviewing AI financial memos. This view
 * shows the same data as AdminClients with a read-only affordance and no
 * navigation to full client profiles.
 */
export default function AnalystClients() {
  return (
    <ClientsTable
      title="Clients"
      subtitle="Seller and buyer accounts on the platform."
      breadcrumbs={[{ label: 'Clients' }]}
      readOnly
    />
  )
}
