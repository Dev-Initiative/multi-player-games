import type { LucideIcon } from 'lucide-react'

type CurrencyProps = {
  icon: LucideIcon
  value: number
}

/** Pill counter for coins, trophies, win streaks. */
export function Currency({ icon: Icon, value }: CurrencyProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-night-950/70 py-1 pr-4 pl-1 ring-1 ring-white/8">
      <span className="grid size-8 place-items-center rounded-full bg-linear-to-b from-gold to-gold-deep text-night-950 shadow-[inset_0_2px_0_rgb(255_255_255/0.5)]">
        <Icon className="size-4.5" strokeWidth={2.75} aria-hidden />
      </span>
      <span className="font-display text-lg font-extrabold tabular-nums">{value.toLocaleString()}</span>
    </span>
  )
}
