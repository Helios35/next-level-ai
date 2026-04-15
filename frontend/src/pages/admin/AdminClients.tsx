import ClientsTable from '@/components/internal/ClientsTable'

interface AdminClientsProps {
  onNavigateToClient: (clientId: string) => void
}

export default function AdminClients({ onNavigateToClient }: AdminClientsProps) {
  return (
    <ClientsTable
      title="Clients"
      subtitle="All buyer and seller accounts on the platform."
      breadcrumbs={[{ label: 'Clients' }]}
      onNavigateToClient={onNavigateToClient}
    />
  )
}
