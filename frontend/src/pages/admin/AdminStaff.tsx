import { useState } from 'react'
import { MOCK_INTERNAL_USERS } from '@/data/mock/internalUsers'
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
import { Plus } from 'lucide-react'
import type { InternalUser } from '@shared/types/internalUser'
import type { InternalRole } from '@shared/types/enums'

const ROLE_LABELS: Record<InternalRole, string> = {
  ds: 'Disposition Specialist',
  analyst: 'Analyst',
  admin: 'Admin',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

interface AdminStaffProps {
  onNavigateToCreate: () => void
}

export default function AdminStaff({ onNavigateToCreate }: AdminStaffProps) {
  const [staff, setStaff] = useState<InternalUser[]>(MOCK_INTERNAL_USERS)
  const [deactivateTarget, setDeactivateTarget] = useState<InternalUser | null>(null)

  const handleDeactivate = () => {
    if (!deactivateTarget) return
    setStaff((prev) =>
      prev.map((s) =>
        s.id === deactivateTarget.id
          ? { ...s, status: s.status === 'active' ? 'inactive' as const : 'active' as const }
          : s
      )
    )
    setDeactivateTarget(null)
  }

  return (
    <>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Staff</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Internal team management and account provisioning.
            </p>
          </div>
          <Button onClick={onNavigateToCreate}>
            <Plus size={16} className="mr-2" />
            Add Staff Member
          </Button>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Login</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{member.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ROLE_LABELS[member.role]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        member.status === 'active'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                      }
                    >
                      {member.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(member.lastLogin)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={
                        member.status === 'active'
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                          : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                      }
                      onClick={() => setDeactivateTarget(member)}
                    >
                      {member.status === 'active' ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      <Dialog open={deactivateTarget !== null} onOpenChange={() => setDeactivateTarget(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {deactivateTarget?.status === 'active'
                ? `Deactivate ${deactivateTarget?.name}?`
                : `Reactivate ${deactivateTarget?.name}?`}
            </DialogTitle>
            <DialogDescription>
              {deactivateTarget?.status === 'active'
                ? 'This will set their account to Inactive. They will not be able to log in. The account will not be deleted.'
                : 'This will restore their access to the platform.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className={
                deactivateTarget?.status === 'active'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }
              onClick={handleDeactivate}
            >
              {deactivateTarget?.status === 'active' ? 'Deactivate' : 'Reactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
