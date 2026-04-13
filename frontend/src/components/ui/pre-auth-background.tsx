import { DotGrid } from '@/components/ui/dot-grid'

export function PreAuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-background">
      {/* Radial gradient bloom — mode-buy accent, adapts light/dark via token.
          Uses color-mix because --color-mode-buy is a full hsl(...) value,
          not raw channels, so hsl(var(--color-mode-buy)/opacity) won't parse. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle 560px at 50% 200px, color-mix(in srgb, var(--color-mode-buy) 18%, transparent), transparent)',
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            'radial-gradient(circle 560px at 50% 200px, color-mix(in srgb, var(--color-mode-buy) 28%, transparent), transparent)',
        }}
      />
      {/* Dot grid — uses existing component and --color-dot-grid token */}
      <DotGrid gap={18} dotSize={1} />
    </div>
  )
}
