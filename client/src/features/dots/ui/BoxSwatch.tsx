import { cn } from '../../../lib/cn'
import type { Seat } from '../../shared/ui/seat'

/** A seat's color as a small claimed box: the Dots and Boxes "piece". */
export function BoxSwatch({ color, className = 'size-4' }: { color: Seat; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('shrink-0 rounded-[30%] shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]', className)}
      style={{ background: `var(--color-${color})` }}
    />
  )
}
