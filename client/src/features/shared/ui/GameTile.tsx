import { Play, Users, type LucideIcon } from 'lucide-react'
import { seatVars, type Seat } from './seat'

type GameTileProps = {
  title: string
  players: string
  icon: LucideIcon
  seat: Seat
  onPlay?: () => void
}

/** Lobby card for picking a game. */
export function GameTile({ title, players, icon: Icon, seat, onPlay }: GameTileProps) {
  return (
    <div
      style={seatVars(seat)}
      className="group relative isolate flex aspect-4/5 flex-col justify-end overflow-hidden rounded-3xl bg-linear-to-br from-(--seat) to-(--seat-deep) p-4 shadow-[0_6px_0_0_color-mix(in_oklab,var(--seat-deep)_65%,black),inset_0_2px_0_rgb(255_255_255/0.3)]"
    >
      <Icon
        aria-hidden
        strokeWidth={1.75}
        className="absolute -top-4 -right-6 -z-10 size-40 rotate-12 text-white/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
      />
      <h3 className="text-2xl leading-none font-extrabold text-white [text-shadow:0_2px_0_rgb(0_0_0/0.18)]">
        {title}
      </h3>
      <div className="mt-1.5 mb-4 flex items-center gap-1.5 text-sm font-semibold text-white/85">
        <Users className="size-4" strokeWidth={2.5} aria-hidden />
        {players}
      </div>
      <button
        type="button"
        onClick={onPlay}
        className="press inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white font-display font-bold text-night-950 [--press-depth:4px] [--press-edge:rgb(0_0_0/0.25)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white"
      >
        <Play className="size-4 fill-current" aria-hidden />
        Play
      </button>
    </div>
  )
}
