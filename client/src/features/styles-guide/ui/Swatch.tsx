import { Disc } from '../../shared/ui/Disc'
import type { Seat } from '../../shared/ui/seat'

// Values are read from the live CSS variables so the guide never drifts from
// the @theme block in index.css.
function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const SEAT_NOTES: Record<string, string> = {
  sky: 'Seat 1',
  tangerine: 'Seat 2',
  lime: 'Seat 3 · success',
  sun: 'Seat 4 · warning',
  gold: 'Rewards',
}

/** One step of a color scale. */
export function Swatch({ token }: { token: string }) {
  return (
    <div className="space-y-2">
      <div className="h-14 rounded-xl ring-1 ring-white/10 ring-inset" style={{ background: `var(--color-${token})` }} />
      <div className="text-xs leading-tight">
        <div className="font-bold">{token}</div>
        <div className="font-mono text-night-400">{cssVar(`--color-${token}`)}</div>
      </div>
    </div>
  )
}

/** A seat (or gold) color with its `-deep` pair and a piece in it. */
export function SeatSwatch({ seat }: { seat: Seat | 'gold' }) {
  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-white/8">
      <div className="h-24 p-3" style={{ background: `var(--color-${seat})` }}>
        <Disc seat={seat === 'gold' ? 'sun' : seat} className="size-8" />
      </div>
      <div className="h-6" style={{ background: `var(--color-${seat}-deep)` }} />
      <div className="bg-night-900 p-3 text-xs leading-snug">
        <div className="font-display text-base font-bold capitalize">{seat}</div>
        <div className="text-night-300">{SEAT_NOTES[seat]}</div>
        <div className="mt-1 font-mono text-night-400">
          {cssVar(`--color-${seat}`)} / {cssVar(`--color-${seat}-deep`)}
        </div>
      </div>
    </div>
  )
}
