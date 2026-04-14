import { type ReactNode } from 'react'

export type AdminView = 'overview' | 'exceptions' | 'pipeline' | 'clients' | 'staff' | 'settings'

interface AdminShellProps {
  children: ReactNode
}

export default function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
