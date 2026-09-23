import { RotateCcw, Trophy } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Button } from '../../shared/ui/Button'
import { Disc } from '../../shared/ui/Disc'
import type { Seat } from '../../shared/ui/seat'
import { cn } from '../../../lib/cn'

const COLS = 7
const ROWS = 6
const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

type Cell = Seat | null

function isWin(board: Cell[], row: number, col: number) {
  const seat = board[row * COLS + col]
  return DIRECTIONS.some(([dr, dc]) => {
    let count = 1
    for (const sign of [1, -1]) {
      let r = row + dr * sign
      let c = col + dc * sign
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r * COLS + c] === seat) {
        count++
        r += dr * sign
        c += dc * sign
      }
    }
    return count >= 4
  })
}

/** Playable Connect 4, local only. Shows the pieces and motion in context. */
export function Connect4Demo() {
  const [board, setBoard] = useState<Cell[]>(() => Array(COLS * ROWS).fill(null))
  const [turn, setTurn] = useState<Seat>('sky')
  const [winner, setWinner] = useState<Seat | null>(null)
  const [hover, setHover] = useState<number | null>(null)

  const full = board.every(Boolean)

  function drop(col: number) {
    if (winner) return
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row * COLS + col]) {
        const next = [...board]
        next[row * COLS + col] = turn
        setBoard(next)
        if (isWin(next, row, col)) setWinner(turn)
        else setTurn(turn === 'sky' ? 'sun' : 'sky')
        return
      }
    }
  }

  function reset() {
    setBoard(Array(COLS * ROWS).fill(null))
    setTurn('sky')
    setWinner(null)
  }

  const name = (seat: Seat) => (seat === 'sky' ? 'Sky' : 'Sun')

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex h-10 items-center gap-3">
        {winner ? (
          <div className="flex animate-pop items-center gap-2 font-display text-2xl font-extrabold">
            <Trophy className="size-7 text-gold" strokeWidth={2.5} />
            {name(winner)} wins!
          </div>
        ) : full ? (
          <div className="font-display text-2xl font-extrabold">Draw</div>
        ) : (
          <>
            <Disc seat={turn} className="size-7" />
            <span className="font-display text-2xl font-extrabold">{name(turn)} to move</span>
          </>
        )}
      </div>

      <div className="w-full max-w-md">
        {/* Hover preview row */}
        <div className="grid grid-cols-7 gap-2 px-3 pb-2">
          {Array.from({ length: COLS }, (_, col) => (
            <div key={col} className="aspect-square p-1">
              {hover === col && !winner && <Disc seat={turn} className="size-full animate-pop opacity-70" />}
            </div>
          ))}
        </div>

        <div
          className="relative grid grid-cols-7 gap-2 overflow-hidden rounded-3xl bg-linear-to-b from-brand-500 to-brand-700 p-3 shadow-[0_8px_0_0_var(--color-brand-900),inset_0_2px_0_rgb(255_255_255/0.3)]"
          onMouseLeave={() => setHover(null)}
        >
          {Array.from({ length: COLS }, (_, col) => (
            <button
              key={col}
              type="button"
              aria-label={`Drop in column ${col + 1}`}
              disabled={!!winner || !!board[col]}
              onClick={() => drop(col)}
              onMouseEnter={() => setHover(col)}
              onFocus={() => setHover(col)}
              className="flex flex-col gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-white/60 disabled:cursor-not-allowed"
            >
              {Array.from({ length: ROWS }, (_, row) => {
                const seat = board[row * COLS + col]
                return (
                  <span
                    key={row}
                    className={cn(
                      'relative block aspect-square rounded-full bg-night-950 shadow-[inset_0_4px_6px_rgb(0_0_0/0.7)]',
                      hover === col && !seat && !winner && 'bg-night-900',
                    )}
                  >
                    {seat && (
                      <Disc
                        seat={seat}
                        className="absolute inset-0.5 animate-drop"
                        style={{ '--drop-rows': row + 1 } as CSSProperties}
                      />
                    )}
                  </span>
                )
              })}
            </button>
          ))}
        </div>
      </div>

      <Button variant="secondary" size="sm" icon={RotateCcw} onClick={reset}>
        New game
      </Button>
    </div>
  )
}
