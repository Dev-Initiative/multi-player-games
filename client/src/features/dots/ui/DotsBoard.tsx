import { motion } from 'motion/react'
import { useState, type KeyboardEvent } from 'react'
import type { Seat } from '../../shared/ui/seat'
import { COLS, EDGE_COUNT, edgeCoords, edgeName, ROWS, type Position } from '../rules'

type DotsBoardProps = {
  position: Position
  /** Color per seat index. */
  colors: Seat[]
  /** Seat whose preview line shows on hover; null when you can't move. */
  playerSeat: number | null
  /** Name per seat; its initials are stamped on the boxes that seat claims. */
  names: string[]
  onDraw: (edge: number) => void
}

// SVG units: one box is S wide, the board has a margin of P around the dots.
const S = 100
const P = 26
const W = COLS * S
const H = ROWS * S
// Hit areas stop short of the dots so neighbouring lines never overlap.
const INSET = 16

const color = (seat: Seat) => `var(--color-${seat})`

function endpoints(edge: number, inset = 0) {
  const { row, col, horizontal } = edgeCoords(edge)
  const x1 = col * S
  const y1 = row * S
  return horizontal
    ? { x1: x1 + inset, y1, x2: x1 + S - inset, y2: y1 }
    : { x1, y1: y1 + inset, x2: x1, y2: y1 + S - inset }
}

const EDGES = Array.from({ length: EDGE_COUNT }, (_, e) => e)

/**
 * The playable grid. Hover or focus a gap between two dots to preview your
 * line, click or press Enter to draw it. Only the newest line and the boxes
 * it closed animate, so reopening a game doesn't replay everything.
 */
export function DotsBoard({ position, colors, playerSeat, names, onDraw }: DotsBoardProps) {
  const { edges, boxes, lastEdge, lastBoxes } = position
  const initials = names.map((n) =>
    n
      .split(/\s+/)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  )
  const [hover, setHover] = useState<number | null>(null)
  const canPlay = playerSeat !== null

  const onKey = (edge: number) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onDraw(edge)
    }
  }

  return (
    <div className="rounded-[1.75rem] bg-linear-to-b from-brand-500 to-brand-700 p-2 shadow-[0_10px_0_0_var(--color-brand-900),inset_0_2px_0_rgb(255_255_255/0.3),0_40px_80px_-30px_rgb(0_0_0/0.9)] sm:p-2.5">
      <div className="rounded-[1.4rem] bg-night-950 p-3 shadow-[inset_0_4px_12px_rgb(0_0_0/0.8)] sm:p-5">
        <svg
          viewBox={`${-P} ${-P} ${W + 2 * P} ${H + 2 * P}`}
          className="block w-full touch-manipulation select-none"
          onMouseLeave={() => setHover(null)}
          role="group"
          aria-label="Dots and Boxes board"
        >
          {/* Grooves where lines can go */}
          {EDGES.map((e) => (
            <line key={e} {...endpoints(e)} stroke="var(--color-night-800)" strokeWidth={10} strokeLinecap="round" />
          ))}

          {/* Claimed boxes */}
          {boxes.map((owner, b) => {
            if (owner === null) return null
            const row = Math.floor(b / COLS)
            const col = b % COLS
            const fresh = lastBoxes.includes(b)
            return (
              <motion.g
                key={b}
                initial={fresh ? { scale: 0, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 16, delay: fresh ? 0.25 : 0 }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              >
                <rect
                  x={col * S + 12}
                  y={row * S + 12}
                  width={S - 24}
                  height={S - 24}
                  rx={16}
                  fill={color(colors[owner])}
                  opacity={0.92}
                />
                <rect
                  x={col * S + 12}
                  y={row * S + 12}
                  width={S - 24}
                  height={(S - 24) / 2}
                  rx={16}
                  fill="white"
                  opacity={0.16}
                />
                <text
                  x={col * S + S / 2}
                  y={row * S + S / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-display"
                  fontSize={30}
                  fontWeight={800}
                  fill="var(--color-night-950)"
                  opacity={0.55}
                >
                  {initials[owner]}
                </text>
              </motion.g>
            )
          })}

          {/* Drawn lines */}
          {EDGES.map((e) => {
            const seat = edges[e]
            if (seat === null) return null
            const isLast = e === lastEdge
            return (
              <motion.line
                key={e}
                {...endpoints(e)}
                stroke={color(colors[seat])}
                strokeWidth={11}
                strokeLinecap="round"
                initial={isLast ? { pathLength: 0 } : false}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={isLast ? { filter: `drop-shadow(0 0 6px ${color(colors[seat])})` } : undefined}
              />
            )
          })}

          {/* Your preview */}
          {canPlay && hover !== null && edges[hover] === null && (
            <line
              {...endpoints(hover)}
              stroke={color(colors[playerSeat])}
              strokeWidth={11}
              strokeLinecap="round"
              opacity={0.5}
              pointerEvents="none"
            />
          )}

          {/* Dots */}
          {Array.from({ length: (ROWS + 1) * (COLS + 1) }, (_, i) => {
            const cx = (i % (COLS + 1)) * S
            const cy = Math.floor(i / (COLS + 1)) * S
            return (
              <g key={i} pointerEvents="none">
                <circle cx={cx} cy={cy + 2.5} r={10} fill="rgb(0 0 0 / 0.5)" />
                <circle cx={cx} cy={cy} r={10} fill="var(--color-night-100)" />
                <circle cx={cx - 3} cy={cy - 3} r={3.5} fill="white" opacity={0.7} />
              </g>
            )
          })}

          {/* Hit areas for open lines, on top so they catch the pointer */}
          {canPlay &&
            EDGES.map((e) =>
              edges[e] === null ? (
                <line
                  key={e}
                  {...endpoints(e, INSET)}
                  stroke="transparent"
                  strokeWidth={42}
                  strokeLinecap="round"
                  pointerEvents="stroke"
                  role="button"
                  tabIndex={0}
                  aria-label={`Draw ${edgeName(e)}`}
                  className="outline-none"
                  onMouseEnter={() => setHover(e)}
                  onFocus={() => setHover(e)}
                  onBlur={() => setHover((h) => (h === e ? null : h))}
                  onClick={() => onDraw(e)}
                  onKeyDown={onKey(e)}
                />
              ) : null,
            )}
        </svg>
      </div>
    </div>
  )
}
