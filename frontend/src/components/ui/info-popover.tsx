import * as React from "react"
import { cn } from "@/utils/cn"
import { Popover, PopoverTrigger, PopoverContent } from "./popover"

interface InfoPopoverProps {
  label: string
  value: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function InfoPopover({
  label,
  value,
  icon,
  children,
  className,
  contentClassName,
}: InfoPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "cursor-pointer text-left rounded-md transition-colors hover:text-foreground hover:bg-muted/50",
            className,
          )}
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent className={cn("max-w-60", contentClassName)}>
        <div className="flex items-start gap-2">
          {icon && (
            <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground break-words">
              {value}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
