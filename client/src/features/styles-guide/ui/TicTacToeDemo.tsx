import { Circle, X } from 'lucide-react'
import { cn } from '../../../lib/cn'

// A finished game: X wins on the diagonal.
const BOARD = ['x', 'o', 'o', null, 'x', null, 'o', null, 'x'] as const
const WINNING = new Set([0, 4, 8])

export function TicTacToeDemo() {
  return (
    <div className="grid w-full max-w-56 grid-cols-3 gap-2 rounded-3xl bg-night-950/60 p-2 ring-1 ring-white/6">
      {BOARD.map((mark, i) => (
        <div
          key={i}
          className={cn(
            'grid aspect-square place-items-center rounded-2xl bg-night-800 shadow-[inset_0_-3px_0_rgb(0_0_0/0.3),inset_0_1px_0_rgb(255_255_255/0.06)]',
            WINNING.has(i) && 'bg-lime/15 ring-2 ring-lime',
          )}
        >
          {mark === 'x' && (
            <X className="size-3/5 animate-pop text-tangerine drop-shadow-[0_3px_0_var(--color-tangerine-deep)]" strokeWidth={3.5} />
          )}
          {mark === 'o' && (
            <Circle className="size-1/2 animate-pop text-sky drop-shadow-[0_3px_0_var(--color-sky-deep)]" strokeWidth={3.5} />
          )}
        </div>
      ))}
    </div>
  )
}
