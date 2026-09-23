import { seatVars, type Seat } from './seat'

type MeterProps = {
  /** 0 to 1. */
  value: number
  seat?: Seat
  label?: string
  detail?: string
}

/** Turn timer, XP bar, loading progress. */
export function Meter({ value, seat = 'lime', label, detail }: MeterProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div style={seatVars(seat)} className="space-y-2">
      {(label || detail) && (
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-bold">{label}</span>
          <span className="font-mono text-night-300">{detail}</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-4 overflow-hidden rounded-full bg-night-950 p-0.5 shadow-[inset_0_2px_4px_rgb(0_0_0/0.6)] ring-1 ring-white/6"
      >
        <div
          className="relative h-full rounded-full bg-linear-to-b from-(--seat) to-(--seat-deep) transition-[width] duration-500 after:absolute after:inset-x-2 after:top-0.5 after:h-1 after:rounded-full after:bg-white/40"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
