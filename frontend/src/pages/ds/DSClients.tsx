import { useState } from 'react'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { DataTableHeader } from '@/components/ui/data-table-header'
import DSSellerClients from './DSSellerClients'
import DSBuyerQueue from './DSBuyerQueue'

type ClientsTab = 'sellers' | 'buyers'

const CLIENT_TABS = [
  { value: 'sellers', label: 'Sellers' },
  { value: 'buyers', label: 'Buyers' },
]

interface DSClientsProps {
  onNavigateToSellerProfile: (sellerId: string) => void
  onNavigateToBuyerProfile: (buyerId: string) => void
}

export default function DSClients({
  onNavigateToSellerProfile,
  onNavigateToBuyerProfile,
}: DSClientsProps) {
  const [tab, setTab] = useState<ClientsTab>('sellers')
  const [search, setSearch] = useState('')

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <Breadcrumbs className="mb-4" items={[{ label: 'Clients' }]} />

      <DataTableHeader
        title="Clients"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={tab === 'sellers' ? 'Search sellers...' : 'Search buyers...'}
        tabs={CLIENT_TABS}
        activeTab={tab}
        onTabChange={(v) => {
          setTab(v as ClientsTab)
          setSearch('')
        }}
      />

      {tab === 'sellers' && (
        <DSSellerClients
          search={search}
          onNavigateToProfile={onNavigateToSellerProfile}
        />
      )}
      {tab === 'buyers' && (
        <DSBuyerQueue
          search={search}
          onNavigateToProfile={onNavigateToBuyerProfile}
        />
      )}
    </div>
  )
}
