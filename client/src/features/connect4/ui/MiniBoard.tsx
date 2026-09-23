import { cn } from '../../../lib/cn'
import type { Seat } from '../../shared/ui/seat'
import type { Position } from '../rules'

const FILL: Record<Seat, string> = {
  sky: 'bg-sky',
  sun: 'bg-sun',
  tangerine: 'bg-tangerine',
  lime: 'bg-lime',
}

/** A thumbnail of the board for game lists. */
export function MiniBoard({ position, colors }: { position: Position; colors: Seat[] }) {
  return (
    <div
      aria-hidden
      className="grid w-20 shrink-0 grid-cols-7 gap-[3px] rounded-lg bg-linear-to-b from-brand-500 to-brand-700 p-1.5"
    >
      {position.board.map((seat, i) => (
        <span
          key={i}
          className={cn(
            'aspect-square rounded-full',
            seat === null ? 'bg-night-950' : FILL[colors[seat]],
            position.lastMove?.index === i && 'ring-1 ring-white',
          )}
        />
      ))}
    </div>
  )
}
