import { useState, type ReactNode } from 'react'
import { ClipboardList, BarChart3, Users, Bell } from 'lucide-react'
import { ExpandableTabs } from '@/components/ui/expandable-tabs'
import type { TabItem } from '@/components/ui/expandable-tabs'

export type DsView = 'tasks' | 'pipeline' | 'notifications' | 'clients'

const DS_TABS: TabItem[] = [
  { title: 'Tasks', icon: ClipboardList },
  { title: 'Pipeline', icon: BarChart3 },
  { title: 'Clients', icon: Users },
]

const VIEW_BY_INDEX: DsView[] = ['tasks', 'pipeline', 'clients']

interface DSShellProps {
  activeView: DsView
  onNavigate: (view: DsView) => void
  children: ReactNode
}

export default function DSShell({ activeView, onNavigate, children }: DSShellProps) {
  const activeIndex = activeView === 'notifications'
    ? null
    : VIEW_BY_INDEX.indexOf(activeView)

  const handleTabChange = (index: number | null) => {
    if (index !== null && index >= 0 && index < VIEW_BY_INDEX.length) {
      onNavigate(VIEW_BY_INDEX[index])
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* ═══ DS TOP-BAR TAB SWITCHER ═══ */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
        <ExpandableTabs
          tabs={DS_TABS}
          activeIndex={activeIndex === -1 ? null : activeIndex}
          onChange={handleTabChange}
          activeColor="text-slate-300"
        />

        {/* Bell icon — notifications */}
        <button
          onClick={() => onNavigate('notifications')}
          className={
            'flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm transition-colors ' +
            (activeView === 'notifications'
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground')
          }
        >
          <Bell size={18} />
          <span className="hidden sm:inline">Notifications</span>
        </button>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
