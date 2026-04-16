"use client"

import * as React from "react"
import { Menu } from "@base-ui/react/menu"
import { cn } from "@/utils/cn"
import { User as UserIcon, Settings as SettingsIcon, LogOut } from "lucide-react"

interface UserMenuProps {
  initials: string
  name: string
  onProfileClick: () => void
  onSettingsClick: () => void
  onSignOut: () => void
  /** Hide the name text — avatar-only trigger (use on narrow shells) */
  compact?: boolean
  /** Optional avatar image URL — falls back to initials when omitted */
  avatarUrl?: string
}

const popupClasses =
  "z-[100] min-w-44 origin-(--transform-origin) overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"

const itemBaseClasses =
  "relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 pr-2 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"

export function UserMenu({
  initials,
  name,
  onProfileClick,
  onSettingsClick,
  onSignOut,
  compact = false,
  avatarUrl,
}: UserMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className="flex items-center gap-2 rounded-full bg-muted p-1 pr-2.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted/80 data-popup-open:text-foreground"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold text-white">
            {initials}
          </div>
        )}
        {!compact && <span className="hidden sm:inline">{name}</span>}
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={6}>
          <Menu.Popup className={cn(popupClasses, "min-w-40")}>
            <Menu.Item
              className={itemBaseClasses}
              closeOnClick
              onClick={onProfileClick}
            >
              <UserIcon size={14} className="shrink-0" />
              Profile
            </Menu.Item>
            <Menu.Item
              className={itemBaseClasses}
              closeOnClick
              onClick={onSettingsClick}
            >
              <SettingsIcon size={14} className="shrink-0" />
              Settings
            </Menu.Item>
            <div className="my-1 h-px bg-border" role="separator" />
            <Menu.Item
              className={itemBaseClasses}
              closeOnClick
              onClick={onSignOut}
            >
              <LogOut size={14} className="shrink-0" />
              Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
