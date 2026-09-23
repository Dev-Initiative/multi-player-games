import type { Seat } from '../../shared/ui/seat'
import { COLS, EDGE_COUNT, edgeCoords, ROWS, type Position } from '../rules'

const S = 20

/** A thumbnail of the board for game lists. */
export function DotsMiniBoard({ position, colors }: { position: Position; colors: Seat[] }) {
  return (
    <div aria-hidden className="w-20 shrink-0 rounded-lg bg-linear-to-b from-brand-500 to-brand-700 p-1">
      <svg viewBox={`-4 -4 ${COLS * S + 8} ${ROWS * S + 8}`} className="block w-full rounded-md bg-night-950">
        {position.boxes.map((owner, b) =>
          owner === null ? null : (
            <rect
              key={b}
              x={(b % COLS) * S + 3}
              y={Math.floor(b / COLS) * S + 3}
              width={S - 6}
              height={S - 6}
              rx={3}
              fill={`var(--color-${colors[owner]})`}
            />
          ),
        )}
        {Array.from({ length: EDGE_COUNT }, (_, e) => {
          const seat = position.edges[e]
          if (seat === null) return null
          const { row, col, horizontal } = edgeCoords(e)
          const x = col * S
          const y = row * S
          return (
            <line
              key={e}
              x1={x}
              y1={y}
              x2={horizontal ? x + S : x}
              y2={horizontal ? y : y + S}
              stroke={`var(--color-${colors[seat]})`}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          )
        })}
        {Array.from({ length: (ROWS + 1) * (COLS + 1) }, (_, i) => (
          <circle key={i} cx={(i % (COLS + 1)) * S} cy={Math.floor(i / (COLS + 1)) * S} r={1.8} fill="var(--color-night-200)" />
        ))}
      </svg>
    </div>
  )
}
