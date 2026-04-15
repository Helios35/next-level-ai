import { useState } from 'react'
import OnboardingShell from '@/components/OnboardingShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'

interface LoginPageProps {
  onSuccess: () => void
  onSignUp: () => void
  onInternalLogin?: () => void
}

export default function LoginPage({ onSuccess, onSignUp, onInternalLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[Login] credentials:', { email })
    onSuccess()
  }

  return (
    <OnboardingShell>
      <div className="flex flex-1 items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 rounded-xl border border-border bg-background p-8"
        >
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Log in</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back to NextLevel.
            </p>
          </div>

          <FieldGroup>
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
          </FieldGroup>

          <Button type="submit" className="w-full">
            Log In
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSignUp}
              className="text-foreground underline hover:text-foreground/80 transition-colors"
            >
              Sign up
            </button>
          </p>

          {onInternalLogin && (
            <p className="text-xs text-muted-foreground/60 text-center">
              <button
                type="button"
                onClick={onInternalLogin}
                className="text-muted-foreground/60 underline hover:text-muted-foreground transition-colors"
              >
                Internal Staff? Log in here
              </button>
            </p>
          )}
        </form>
      </div>
    </OnboardingShell>
  )
}
