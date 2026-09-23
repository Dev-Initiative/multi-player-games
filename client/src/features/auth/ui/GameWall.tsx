import { Lock } from 'lucide-react'
import { motion } from 'motion/react'
import { GAMES, type Game } from '../../games/catalog'
import { seatVars } from '../../shared/ui/seat'

function WallTile({ game }: { game: Game }) {
  const { title, players, icon: Icon, seat, status } = game
  return (
    <div
      style={seatVars(seat)}
      className="relative isolate aspect-4/5 shrink-0 overflow-hidden rounded-3xl bg-linear-to-br from-(--seat) to-(--seat-deep) p-4 shadow-[0_6px_0_0_color-mix(in_oklab,var(--seat-deep)_65%,black),inset_0_2px_0_rgb(255_255_255/0.3)]"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(rgb(0_0_0/0.16)_1.5px,transparent_1.5px)] bg-size-[16px_16px]" />
      <Icon strokeWidth={1.75} className="absolute -right-5 -bottom-5 -z-10 size-32 -rotate-12 text-white/30" />
      {status === 'soon' && (
        <span className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-night-950/40 text-white">
          <Lock className="size-3.5" strokeWidth={2.75} />
        </span>
      )}
      <div className="flex h-full flex-col justify-end">
        <div className="font-display text-xl leading-tight font-extrabold text-white [text-shadow:0_2px_0_rgb(0_0_0/0.2)]">
          {title}
        </div>
        <div className="text-xs font-semibold text-white/80">{status === 'soon' ? 'Coming soon' : players}</div>
      </div>
    </div>
  )
}

/** One endlessly scrolling column. The list is doubled so the loop is seamless. */
function Column({ games, duration, reverse }: { games: Game[]; duration: number; reverse?: boolean }) {
  return (
    <motion.div
      className="flex flex-col gap-4"
      animate={{ y: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      {[...games, ...games].map((game, i) => (
        <WallTile key={`${game.id}-${i}`} game={game} />
      ))}
    </motion.div>
  )
}

// Spread the catalog over three columns, each starting at a different game.
const rotate = (n: number) => [...GAMES.slice(n), ...GAMES.slice(0, n)]

/** Tilted wall of every game in the library, drifting past. Decorative. */
export function GameWall() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute -inset-x-16 -inset-y-40 grid rotate-[-10deg] grid-cols-3 gap-4">
        <Column games={rotate(0)} duration={60} />
        <Column games={rotate(3)} duration={75} reverse />
        <Column games={rotate(6)} duration={55} />
      </div>
    </div>
  )
}
