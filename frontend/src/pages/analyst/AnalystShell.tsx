import { type ReactNode } from 'react'

export type AnalystView = 'queue' | 'completed' | 'pipeline' | 'settings'

interface AnalystShellProps {
  children: ReactNode
}

export default function AnalystShell({ children }: AnalystShellProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
