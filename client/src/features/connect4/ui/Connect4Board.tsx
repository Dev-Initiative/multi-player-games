import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '../../../lib/cn'
import { Disc } from '../../shared/ui/Disc'
import type { Seat } from '../../shared/ui/seat'
import { indexOf, landingRow, type Position } from '../rules'

type Connect4BoardProps = {
  position: Position
  /** Disc color per seat index. */
  colors: Seat[]
  /** The seat whose preview disc shows on hover; null when you can't move. */
  playerSeat: number | null
  onDrop: (column: number) => void
}

/**
 * The playable board. Hover or focus a column to preview, click or press
 * 1–9 to drop. Only the newest disc animates in, so reopening a game
 * doesn't rain every disc down again.
 */
export function Connect4Board({ position, colors, playerSeat, onDrop }: Connect4BoardProps) {
  const { board, winLine, lastMove, config: c } = position
  const grid = { gridTemplateColumns: `repeat(${c.cols}, minmax(0, 1fr))` }
  const gap = c.cols > 7 ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-3'
  const [hover, setHover] = useState<number | null>(null)
  const canPlay = playerSeat !== null
  const won = winLine.length > 0

  // Number keys drop into that column (boards are at most 9 wide).
  useEffect(() => {
    if (!canPlay) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea')) return
      const col = Number(e.key) - 1
      if (Number.isInteger(col) && col >= 0 && col < c.cols && landingRow(board, col, c) !== null) onDrop(col)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canPlay, board, onDrop, c])

  const hoverRow = hover !== null && canPlay ? landingRow(board, hover, c) : null

  return (
    <div className="w-full" onMouseLeave={() => setHover(null)}>
      {/* Preview row */}
      <div className={cn('grid px-3 pb-3 sm:px-4', gap)} style={grid} aria-hidden>
        {Array.from({ length: c.cols }, (_, col) => (
          <div key={col} className="relative aspect-square">
            {canPlay && hover === col && hoverRow !== null && (
              <motion.div
                layoutId="connect4-preview"
                className="absolute inset-1"
                transition={{ type: 'spring', stiffness: 700, damping: 40 }}
              >
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Disc seat={colors[playerSeat]} className="size-full" />
                </motion.div>
              </motion.div>
            )}
            <span className="absolute inset-x-0 -bottom-5 text-center font-mono text-[10px] text-night-500">
              {col + 1}
            </span>
          </div>
        ))}
      </div>

      <div
        style={grid}
        className={cn(
          'relative grid rounded-[1.75rem] bg-linear-to-b from-brand-500 to-brand-700 p-3 shadow-[0_10px_0_0_var(--color-brand-900),inset_0_2px_0_rgb(255_255_255/0.3),0_40px_80px_-30px_rgb(0_0_0/0.9)] sm:p-4',
          gap,
        )}
      >
        {Array.from({ length: c.cols }, (_, col) => {
          const full = landingRow(board, col, c) === null
          return (
            <button
              key={col}
              type="button"
              aria-label={`Column ${col + 1}${full ? ', full' : ''}`}
              disabled={!canPlay || full}
              onClick={() => onDrop(col)}
              onMouseEnter={() => setHover(col)}
              onFocus={() => setHover(col)}
              className={cn(
                'relative flex flex-col rounded-full transition-colors',
                gap,
                'outline-none focus-visible:ring-3 focus-visible:ring-white/70',
                canPlay && !full && 'hover:bg-white/8',
                (!canPlay || full) && 'cursor-not-allowed',
              )}
            >
              {Array.from({ length: c.rows }, (_, row) => {
                const index = indexOf(row, col, c)
                const seat = board[index]
                const isLast = lastMove?.index === index
                const inLine = winLine.includes(index)
                const isTarget = hover === col && hoverRow === row
                return (
                  <span
                    key={row}
                    className={cn(
                      'relative block aspect-square rounded-full bg-night-950 shadow-[inset_0_4px_6px_rgb(0_0_0/0.75)] transition-colors',
                      isTarget && 'bg-night-800',
                    )}
                  >
                    {seat !== null && (
                      <motion.span
                        className="absolute inset-0.5"
                        initial={isLast ? { y: `-${(row + 2) * 118}%` } : false}
                        animate={{
                          y: '0%',
                          opacity: won && !inLine ? 0.35 : 1,
                          scale: inLine ? [1, 1.08, 1] : 1,
                        }}
                        transition={{
                          y: { type: 'spring', stiffness: 320, damping: 18 },
                          opacity: { duration: 0.4 },
                          scale: inLine ? { duration: 0.9, repeat: Infinity, delay: 0.4 } : { duration: 0.2 },
                        }}
                      >
                        <Disc seat={colors[seat]} className="size-full" />
                        {isLast && !won && (
                          <span className="absolute inset-[30%] rounded-full ring-2 ring-white/70" aria-hidden />
                        )}
                        {inLine && (
                          <span className="absolute -inset-0.5 rounded-full ring-3 ring-gold" aria-hidden />
                        )}
                      </motion.span>
                    )}
                  </span>
                )
              })}
            </button>
          )
        })}
      </div>
    </div>
  )
}
