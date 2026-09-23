import type { CSSProperties } from 'react'

/** One color per player seat, in seating order. */
export const SEATS = ['sky', 'tangerine', 'lime', 'sun'] as const
export type Seat = (typeof SEATS)[number]

/**
 * Exposes a seat's colors as --seat / --seat-deep / --glow so components can
 * style any seat with the same classes, e.g. `bg-(--seat)`.
 */
export function seatVars(seat: Seat): CSSProperties {
  return {
    '--seat': `var(--color-${seat})`,
    '--seat-deep': `var(--color-${seat}-deep)`,
    '--glow': `color-mix(in oklab, var(--color-${seat}) 55%, transparent)`,
  } as CSSProperties
}

/**
 * A stable color for a player outside a game (profile, header), so the same
 * username always gets the same color. In a game, use their seat instead.
 */
export function colorFor(username: string): Seat {
  let hash = 0
  for (const ch of username.toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return SEATS[Math.abs(hash) % SEATS.length]
}
