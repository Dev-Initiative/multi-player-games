import { motion } from 'motion/react'
import { Disc } from '../../shared/ui/Disc'
import type { Seat } from '../../shared/ui/seat'

const COLS = 7
const ROWS = 6

// A Connect 4 game replayed in order, one disc at a time. Sky ends with three stacked
// in column 3 and the winning drop hovering above it.
const MOVES: { row: number; col: number; seat: Seat }[] = [
  { row: 5, col: 3, seat: 'sky' },
  { row: 5, col: 2, seat: 'sun' },
  { row: 4, col: 3, seat: 'sky' },
  { row: 5, col: 4, seat: 'sun' },
  { row: 5, col: 1, seat: 'sky' },
  { row: 4, col: 2, seat: 'sun' },
  { row: 3, col: 3, seat: 'sky' },
  { row: 4, col: 4, seat: 'sun' },
  { row: 5, col: 5, seat: 'sky' },
  { row: 3, col: 2, seat: 'sun' },
]

const FIRST_DROP = 0.7
const DROP_GAP = 0.32

export function Connect4Preview() {
  const done = FIRST_DROP + MOVES.length * DROP_GAP

  return (
    <div className="relative">
      {/* The winning move, waiting */}
      <div className="absolute -top-16 left-3 grid w-[calc(100%-1.5rem)] grid-cols-7 gap-2 sm:gap-2.5">
        <motion.div
          className="col-start-4 p-0.5"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: [0, -12, 0] }}
          transition={{
            opacity: { delay: done, duration: 0.3 },
            y: { delay: done, duration: 1.1, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <Disc seat="sky" className="w-full" />
        </motion.div>
      </div>

      <div className="grid grid-cols-7 gap-2 rounded-[1.75rem] bg-linear-to-b from-brand-500 to-brand-700 p-3 shadow-[0_12px_0_0_var(--color-brand-900),inset_0_2px_0_rgb(255_255_255/0.3),0_50px_100px_-30px_rgb(0_0_0/0.9)] sm:gap-2.5 sm:p-4">
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const row = Math.floor(i / COLS)
          const col = i % COLS
          const index = MOVES.findIndex((m) => m.row === row && m.col === col)
          const move = MOVES[index]
          return (
            <span
              key={i}
              className="relative aspect-square rounded-full bg-night-950 shadow-[inset_0_4px_6px_rgb(0_0_0/0.75)]"
            >
              {move && (
                <motion.span
                  className="absolute inset-0.5 z-10"
                  initial={{ y: `-${(row + 2) * 118}%`, opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{
                    y: { type: 'spring', stiffness: 260, damping: 16, delay: FIRST_DROP + index * DROP_GAP },
                    opacity: { duration: 0.1, delay: FIRST_DROP + index * DROP_GAP },
                  }}
                >
                  <Disc seat={move.seat} className="size-full" />
                </motion.span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}
