import { type ReactNode } from 'react'

export type DsView = 'tasks' | 'pipeline' | 'notifications' | 'clients'

// ── Shell content wrapper ─────────────────────────────────────────────────

interface DSShellProps {
  children: ReactNode
}

export default function DSShell({ children }: DSShellProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
