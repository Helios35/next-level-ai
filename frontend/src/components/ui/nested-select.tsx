"use client"

import * as React from "react"
import { Menu } from "@base-ui/react/menu"
import { cn } from "@/utils/cn"
import { ChevronDownIcon, ChevronRightIcon, CheckIcon } from "lucide-react"

interface NestedSelectGroup {
  label: string
  options: { value: string; label: string }[]
}

interface NestedSelectProps {
  groups: NestedSelectGroup[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Resolve the display label for a selected value by scanning all groups
function resolveLabel(groups: NestedSelectGroup[], value: string): string | undefined {
  for (const group of groups) {
    const match = group.options.find((o) => o.value === value)
    if (match) return match.label
  }
  return undefined
}

const triggerClasses =
  "flex w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 h-8 dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

const popupClasses =
  "z-50 min-w-44 origin-(--transform-origin) overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"

const itemBaseClasses =
  "relative flex w-full cursor-default items-center rounded-md py-1.5 pr-2 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"

export function NestedSelect({
  groups,
  value,
  onValueChange,
  placeholder = "Select...",
  className,
}: NestedSelectProps) {
  const displayLabel = resolveLabel(groups, value)

  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(triggerClasses, className)}
      >
        <span className={cn("flex flex-1 text-left line-clamp-1", !displayLabel && "text-muted-foreground")}>
          {displayLabel ?? placeholder}
        </span>
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={4}>
          <Menu.Popup className={popupClasses}>
            {groups.map((group) => (
              <Menu.SubmenuRoot key={group.label}>
                <Menu.SubmenuTrigger
                  className={cn(itemBaseClasses, "justify-between gap-2 pr-1.5")}
                >
                  {group.label}
                  <ChevronRightIcon className="size-4 text-muted-foreground" />
                </Menu.SubmenuTrigger>

                <Menu.Portal>
                  <Menu.Positioner side="right" align="start" sideOffset={0}>
                    <Menu.Popup className={popupClasses}>
                      {group.options.map((option) => (
                        <Menu.Item
                          key={option.value}
                          className={cn(itemBaseClasses, "pr-8")}
                          closeOnClick
                          onClick={() => onValueChange(option.value)}
                        >
                          {option.label}
                          {value === option.value && (
                            <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                              <CheckIcon className="size-4" />
                            </span>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.SubmenuRoot>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
