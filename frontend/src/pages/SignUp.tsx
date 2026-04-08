import { useState, useMemo } from 'react'
import type { UserRole, OwnerSourceType } from '@shared/types/enums'
import type { User } from '@shared/types/user'
import { MOCK_SOURCES } from '@/data/mock/sources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'

// ── URL params ─────────────────────────────────────────────────────────────

const searchParams = new URLSearchParams(window.location.search)
const srcToken = searchParams.get('src')
const roleParam = searchParams.get('role')

// ── Role options ───────────────────────────────────────────────────────────

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'both', label: 'Both' },
  { value: 'broker', label: 'Broker' },
]

// ── Component ──────────────────────────────────────────────────────────────

export default function SignUp() {
  const isSourced = srcToken !== null
  const initialRole: UserRole = isSourced ? 'seller' : (roleParam as UserRole) ?? 'buyer'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState<UserRole>(initialRole)

  // Resolve source attribution
  const ownerSourceType: OwnerSourceType = isSourced ? 'sourced' : 'direct'
  const sourceId = useMemo(() => {
    if (!srcToken) return null
    return MOCK_SOURCES.find(s => s.uniqueLinkToken === srcToken)?.id ?? null
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const initials = name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const user: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      company,
      role,
      brokerFlag: role === 'broker',
      avatarInitials: initials,
      qualificationComplete: false,
      createdAt: new Date().toISOString(),
      ownerSourceType,
      sourceId,
    }

    // Prototype: log to console — production writes to Supabase
    console.log('[SignUp] User record created:', user)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-xl border border-border bg-background p-8"
      >
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Get started with NextLevel.
          </p>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel>Full Name</FieldLabel>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Marcus Webb"
              required
            />
          </Field>

          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="marcus@company.com"
              required
            />
          </Field>

          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </Field>

          <Field>
            <FieldLabel>Company</FieldLabel>
            <Input
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Triangle Capital Group"
              required
            />
          </Field>

          <Field>
            <FieldLabel>I am a...</FieldLabel>
            <ToggleGroup
              type="single"
              variant="outline"
              value={role}
              onValueChange={(val) => { if (val && !isSourced) setRole(val as UserRole) }}
              disabled={isSourced}
              className="w-full"
            >
              {ROLE_OPTIONS.map((opt) => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  className="flex-1"
                  disabled={isSourced}
                >
                  {opt.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        </FieldGroup>

        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
    </div>
  )
}
