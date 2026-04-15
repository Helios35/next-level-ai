import { useState } from 'react'
import { User as UserIcon, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import type { InternalUser } from '@shared/types/internalUser'
import type { InternalRole } from '@shared/types/enums'
import { SectionCard } from '@/components/ui/section-card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const ROLE_LABELS: Record<InternalRole, string> = {
  ds: 'Disposition Specialist',
  analyst: 'Analyst',
  admin: 'Admin',
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

interface InternalProfileProps {
  user: InternalUser
}

export default function InternalProfile({ user }: InternalProfileProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // ── Password change state (client-side only; console logs for now) ──────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMessage, setPwMessage] = useState<
    { kind: 'ok' | 'err'; text: string } | null
  >(null)

  const handlePasswordSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwMessage({ kind: 'err', text: 'All password fields are required.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ kind: 'err', text: 'New passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setPwMessage({
        kind: 'err',
        text: 'New password must be at least 8 characters.',
      })
      return
    }
    console.log('[InternalProfile] password change requested')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPwMessage({ kind: 'ok', text: 'Password updated.' })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-600 text-xl font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-foreground">
            {user.name}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-400">
              <ShieldCheck size={12} className="mr-1" />
              {ROLE_LABELS[user.role]}
            </Badge>
            <Badge
              className={
                user.status === 'active'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
              }
            >
              {user.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Account info ─────────────────────────────────────────────── */}
      <SectionCard title="Account" icon={UserIcon}>
        <div className="space-y-3">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input value={user.email} readOnly disabled />
          </Field>
          <Field>
            <FieldLabel>Role</FieldLabel>
            <Input value={ROLE_LABELS[user.role]} readOnly disabled />
          </Field>
          <Field>
            <FieldLabel>Last login</FieldLabel>
            <Input value={formatTimestamp(user.lastLogin)} readOnly disabled />
          </Field>
        </div>
      </SectionCard>

      {/* ── Change password ──────────────────────────────────────────── */}
      <div className="mt-4">
        <SectionCard title="Change password" icon={ShieldCheck}>
          <div className="space-y-3">
            <Field>
              <FieldLabel>Current password</FieldLabel>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <Field>
              <FieldLabel>New password</FieldLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </Field>
            <Field>
              <FieldLabel>Confirm new password</FieldLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </Field>

            {pwMessage && (
              <div
                className={
                  'flex items-center gap-2 rounded-md border px-3 py-2 text-sm ' +
                  (pwMessage.kind === 'ok'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-red-500/30 bg-red-500/10 text-red-400')
                }
              >
                {pwMessage.kind === 'ok' ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <AlertCircle size={14} />
                )}
                {pwMessage.text}
              </div>
            )}

            <div className="pt-1">
              <Button onClick={handlePasswordSubmit}>Update password</Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
