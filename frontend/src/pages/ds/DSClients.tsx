import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DSSellerClients from './DSSellerClients'
import DSBuyerQueue from './DSBuyerQueue'

interface DSClientsProps {
  onNavigateToSellerProfile: (sellerId: string) => void
  onNavigateToBuyerProfile: (buyerId: string) => void
}

export default function DSClients({ onNavigateToSellerProfile, onNavigateToBuyerProfile }: DSClientsProps) {
  const [tab, setTab] = useState<'sellers' | 'buyers'>('sellers')

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Clients</h1>
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'sellers' | 'buyers')}>
          <TabsList>
            <TabsTrigger value="sellers">Sellers</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tab === 'sellers' && (
        <DSSellerClients onNavigateToProfile={onNavigateToSellerProfile} />
      )}
      {tab === 'buyers' && (
        <DSBuyerQueue onNavigateToProfile={onNavigateToBuyerProfile} />
      )}
    </div>
  )
}
