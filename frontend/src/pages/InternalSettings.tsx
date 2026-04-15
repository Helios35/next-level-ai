import { useState } from 'react'
import { Bell, Moon } from 'lucide-react'
import type { InternalRole } from '@shared/types/enums'
import { SectionCard } from '@/components/ui/section-card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Toggle } from '@/components/ui/toggle'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CADENCE_OPTIONS = [
  { value: 'real_time', label: 'Real Time' },
  { value: 'every_hour', label: 'Every Hour' },
  { value: 'every_4h', label: 'Every 4 Hours' },
  { value: 'every_12h', label: 'Every 12 Hours' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
]

interface NotificationPrefs {
  enabled: boolean
  cadence: string
}

interface InternalSettingsProps {
  role: InternalRole
}

export default function InternalSettings({ role }: InternalSettingsProps) {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    enabled: true,
    cadence: 'real_time',
  })

  const [darkMode, setDarkMode] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )

  const handlePrefsChange = (next: NotificationPrefs) => {
    setPrefs(next)
    console.log('[InternalSettings] notification preference updated:', {
      role,
      enabled: next.enabled,
      cadence: next.cadence,
    })
  }

  const handleDarkToggle = (next: boolean) => {
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <div className="px-6 py-5 space-y-5">
      <h1 className="text-xl font-semibold text-foreground">Settings</h1>

      <SectionCard icon={Bell} title="Notifications">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-foreground">
              Receive internal notifications
            </span>
            <Toggle
              variant="outline"
              pressed={prefs.enabled}
              onPressedChange={(pressed) =>
                handlePrefsChange({ ...prefs, enabled: pressed })
              }
            >
              {prefs.enabled ? 'On' : 'Off'}
            </Toggle>
          </div>
          {prefs.enabled && (
            <Field>
              <FieldLabel className="text-xs text-muted-foreground">
                How often would you like to be notified?
              </FieldLabel>
              <Select
                items={CADENCE_OPTIONS}
                value={prefs.cadence}
                onValueChange={(value) =>
                  handlePrefsChange({ ...prefs, cadence: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select cadence…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CADENCE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        </div>
      </SectionCard>

      <SectionCard icon={Moon} title="Appearance">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-foreground">Dark Mode</span>
          <Toggle
            variant="outline"
            pressed={darkMode}
            onPressedChange={handleDarkToggle}
          >
            {darkMode ? 'On' : 'Off'}
          </Toggle>
        </div>
      </SectionCard>
    </div>
  )
}
