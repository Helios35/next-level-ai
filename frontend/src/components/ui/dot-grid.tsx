import { cn } from '@/utils/cn'

interface DotGridProps {
  className?: string
  /** Gap between dots in pixels. Default: 8 */
  gap?: number
  /** Square dot size in pixels. Default: 1 */
  dotSize?: number
}

/**
 * Pure-CSS square dot grid background pattern.
 * Two layers: a base grid + a brighter center layer with radial fade.
 */
export function DotGrid({ className, gap = 8, dotSize = 1 }: DotGridProps) {
  const squareDot = `linear-gradient(var(--color-dot-grid) ${dotSize}px, transparent ${dotSize}px)`
  const squareDotH = `linear-gradient(90deg, var(--color-dot-grid) ${dotSize}px, transparent ${dotSize}px)`
  const bgSize = `${gap}px ${gap}px`

  const sharedMask = {
    maskComposite: 'intersect' as const,
    WebkitMaskComposite: 'source-in' as const,
  }

  return (
    <div className={cn('pointer-events-none absolute inset-0 z-0', className)}>
      {/* Base layer — subtle across the full area */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `${squareDot}, ${squareDotH}`,
          backgroundSize: bgSize,
          maskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, black 0%, black 75%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, black 0%, black 75%, transparent 100%)',
          ...sharedMask,
        }}
      />
      {/* Center highlight layer — stronger in the middle, radial fade */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `${squareDot}, ${squareDotH}`,
          backgroundSize: bgSize,
          maskImage:
            'radial-gradient(ellipse 50% 45% at 50% 40%, black 0%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 50% 45% at 50% 40%, black 0%, transparent 100%)',
        }}
      />
    </div>
  )
}
