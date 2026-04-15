import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import type { InternalRole } from '@shared/types/enums'

const ROLE_OPTIONS: { value: InternalRole; label: string }[] = [
  { value: 'ds', label: 'Disposition Specialist' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'admin', label: 'Admin' },
]

interface AdminStaffCreateProps {
  onBack: () => void
}

export default function AdminStaffCreate({ onBack }: AdminStaffCreateProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InternalRole>('ds')
  const [submitted, setSubmitted] = useState(false)

  const isValid = name.trim().length > 0 && email.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <UserPlus size={24} className="text-emerald-400" />
          </div>
        </div>
        <h1 className="text-lg font-bold text-foreground">Account Created</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {name} has been provisioned as a {ROLE_OPTIONS.find((r) => r.value === role)?.label}.
          Communicate credentials to the new staff member off-platform.
        </p>
        <Button className="mt-6" onClick={onBack}>
          Back to Staff
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: 'Staff', onClick: onBack },
          { label: 'Add Staff Member' },
        ]}
      />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Add Staff Member</h1>
        <p className="text-xs text-muted-foreground">
          Provision a new internal user account.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Role <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRole(option.value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    role === option.value
                      ? 'border-slate-500 bg-slate-600 text-white'
                      : 'border-border bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button disabled={!isValid} onClick={handleSubmit}>
            <UserPlus size={16} className="mr-2" />
            Create Account
          </Button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          No automated email in MVP. Admin communicates credentials to the new staff member
          off-platform.
        </p>
      </div>
    </div>
  )
}
