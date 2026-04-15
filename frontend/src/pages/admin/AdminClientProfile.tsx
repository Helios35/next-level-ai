import { useState, useMemo } from 'react'
import { MOCK_CLIENTS, type ClientRecord } from '@/data/mock/clients'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Ban, CheckCircle } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'

interface DealHistoryEntry {
  dealName: string
  stage: number
  status: string
}

// Mock deal history
const MOCK_DEAL_HISTORY: Record<string, DealHistoryEntry[]> = {
  client_001: [
    { dealName: 'Magnolia Farms BFR — Charlotte', stage: 8, status: 'Active' },
    { dealName: 'Triangle SFR Portfolio — Raleigh', stage: 3, status: 'Active' },
  ],
  client_002: [
    { dealName: 'Lakewood Multifamily — Tampa', stage: 4, status: 'Active' },
  ],
  client_003: [
    { dealName: 'Magnolia Farms BFR — Charlotte', stage: 8, status: 'Seated' },
    { dealName: 'Riverside Estates — Atlanta', stage: 7, status: 'Seated' },
    { dealName: 'Oakwood Portfolio — Dallas', stage: 7, status: 'Wait Queue' },
  ],
  client_004: [
    { dealName: 'Magnolia Farms BFR — Charlotte', stage: 8, status: 'Seated' },
  ],
  client_005: [],
  client_006: [
    { dealName: 'Pine Ridge Land Parcel — Nashville', stage: 4, status: 'Rejected' },
  ],
}

interface AdminClientProfileProps {
  clientId: string
  onBack: () => void
}

export default function AdminClientProfile({ clientId, onBack }: AdminClientProfileProps) {
  const client = useMemo(
    () => MOCK_CLIENTS.find((c) => c.id === clientId),
    [clientId]
  )

  const [notes, setNotes] = useState('')
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [accountStatus, setAccountStatus] = useState(client?.accountStatus ?? 'active')

  if (!client) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Client not found.</p>
      </div>
    )
  }

  const dealHistory = MOCK_DEAL_HISTORY[clientId] ?? []
  const isSuspended = accountStatus === 'suspended'

  const handleSuspendConfirm = () => {
    setAccountStatus(isSuspended ? 'active' : 'suspended')
    setShowSuspendModal(false)
  }

  return (
    <>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Breadcrumbs
          className="mb-4"
          items={[
            { label: 'Clients', onClick: onBack },
            { label: client.name },
          ]}
        />
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
          <p className="text-xs text-muted-foreground">
            {client.type === 'buyer' ? 'Buyer' : 'Seller'} account
          </p>
        </div>

        {/* Contact Info */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-base font-semibold text-foreground">Contact Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name</span>
              <p className="font-medium text-foreground">{client.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email</span>
              <p className="font-medium text-foreground">{client.email}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Account Status</span>
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className={
                    isSuspended
                      ? 'border-red-500/30 bg-red-500/10 text-red-400'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  }
                >
                  {isSuspended ? 'Suspended' : 'Active'}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Joined</span>
              <p className="font-medium text-foreground">
                {new Date(client.joinedDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Deal History */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-base font-semibold text-foreground">Deal History</h2>
          {dealHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deal history.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {dealHistory.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5"
                >
                  <span className="text-sm font-medium text-foreground">{entry.dealName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Stage {entry.stage}</span>
                    <Badge variant="outline" className="border-slate-500/30 bg-slate-500/10 text-slate-400">
                      {entry.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-base font-semibold text-foreground">Admin Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add notes about this client..."
            className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Actions */}
        <Button
          variant="outline"
          className={
            isSuspended
              ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
              : 'border-red-500/50 text-red-400 hover:bg-red-500/10'
          }
          onClick={() => setShowSuspendModal(true)}
        >
          {isSuspended ? (
            <>
              <CheckCircle size={16} className="mr-2" />
              Reactivate Account
            </>
          ) : (
            <>
              <Ban size={16} className="mr-2" />
              Suspend Account
            </>
          )}
        </Button>
      </div>

      {/* Suspension Confirmation Modal */}
      <Dialog open={showSuspendModal} onOpenChange={setShowSuspendModal}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {isSuspended ? 'Reactivate this account?' : 'Suspend this account?'}
            </DialogTitle>
            <DialogDescription>
              {isSuspended
                ? `This will restore ${client.name}'s access to the platform.`
                : `This will suspend ${client.name}'s access to the platform. The account will not be deleted.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className={
                isSuspended
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
              onClick={handleSuspendConfirm}
            >
              {isSuspended ? 'Reactivate' : 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
