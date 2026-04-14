import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { MOCK_INTERNAL_USERS } from '@/data/mock/internalUsers'
import type { InternalUser } from '@shared/types/internalUser'

interface InternalLoginProps {
  onSuccess: (user: InternalUser) => void
}

export default function InternalLogin({ onSuccess }: InternalLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Mock auth — match email against internal users
    const matched = MOCK_INTERNAL_USERS.find(
      (u) => u.email === email && u.status === 'active',
    )

    if (matched) {
      onSuccess(matched)
    } else {
      setError('Invalid credentials. Internal accounts only.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top bar — wordmark only */}
      <div className="flex items-center px-6 py-4 border-b border-border">
        <span className="text-lg font-semibold text-foreground">
          NextLevel
          <span className="ml-1.5 text-xs font-normal text-slate-500">internal</span>
        </span>
      </div>

      {/* Login form */}
      <div className="flex flex-1 items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 rounded-xl border border-border bg-background p-8"
        >
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Internal Login</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access the internal portal.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@nextlevel.io"
                required
              />
            </Field>

            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full bg-slate-600 hover:bg-slate-500 text-white">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}
