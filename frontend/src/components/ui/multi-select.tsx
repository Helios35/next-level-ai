import { useState, useRef, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface MultiSelectProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Search...',
}: MultiSelectProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const userClickedRef = useRef(false)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    )
  }

  function removeTag(value: string) {
    onChange(selected.filter((v) => v !== value))
  }

  const labelMap = Object.fromEntries(options.map((o) => [o.value, o.label]))

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-2 cursor-text min-h-[38px]"
        onMouseDown={() => {
          userClickedRef.current = true
        }}
        onClick={() => {
          setOpen(true)
          inputRef.current?.focus()
        }}
      >
        {selected.map((val) => (
          <span
            key={val}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-foreground"
          >
            {labelMap[val] ?? val}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(val)
              }}
              className="rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <div className="relative flex-1 min-w-[80px]">
          <Search
            size={12}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            placeholder={selected.length === 0 ? placeholder : 'Search...'}
            className="w-full bg-transparent pl-4 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => {
              if (userClickedRef.current) {
                setOpen(true)
                userClickedRef.current = false
              }
            }}
          />
        </div>
      </div>

      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((opt) => {
              const checked = selected.includes(opt.value)
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(opt.value)}
                  />
                  <span className="text-sm text-foreground truncate">
                    {opt.label}
                  </span>
                </label>
              )
            })
          ) : (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
