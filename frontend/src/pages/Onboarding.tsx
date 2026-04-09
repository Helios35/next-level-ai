import { useState } from 'react'
import type { User } from '@shared/types/user'
import OnboardingShell from '@/components/OnboardingShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'

interface OnboardingProps {
  user: User
  onComplete: (user: User) => void
}

export default function Onboarding({ user, onComplete }: OnboardingProps) {
  const [displayName, setDisplayName] = useState(user.name)
  const [company, setCompany] = useState(user.company)

  const firstName = user.name.split(' ')[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete({ ...user, name: displayName, company })
  }

  return (
    <OnboardingShell step={2} totalSteps={2}>
      <div className="flex flex-1 items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 rounded-xl border border-border bg-background p-8"
        >
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">
              Welcome, {firstName}.
            </h1>
            <p className="text-sm text-muted-foreground">
              Let's confirm a few details before we get started.
            </p>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel>Display Name</FieldLabel>
              <Input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Company</FieldLabel>
              <Input
                value={company}
                onChange={e => setCompany(e.target.value)}
                required
              />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </div>
    </OnboardingShell>
  )
}
