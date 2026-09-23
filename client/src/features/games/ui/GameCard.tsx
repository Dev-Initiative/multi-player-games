import { Clock, Lock, Play, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '../../../lib/cn'
import { Badge } from '../../shared/ui/Badge'
import { seatVars } from '../../shared/ui/seat'
import type { Game } from '../catalog'

/** A game in the library: art on top, rules and meta below. */
export function GameCard({ game, onPlay }: { game: Game; onPlay?: () => void }) {
  const { title, tagline, players, length, icon: Icon, seat, status } = game
  const soon = status === 'soon'

  return (
    <motion.article
      whileHover={soon ? undefined : { y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={seatVars(seat)}
      className="panel group flex h-full w-full flex-col overflow-hidden rounded-3xl"
    >
      <div
        className={cn(
          'relative isolate h-40 overflow-hidden bg-linear-to-br from-(--seat) to-(--seat-deep)',
          soon && 'grayscale-[0.7] brightness-50',
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(rgb(0_0_0/0.16)_1.5px,transparent_1.5px)] bg-size-[18px_18px]"
        />
        <Icon
          aria-hidden
          strokeWidth={1.75}
          className="absolute -right-4 -bottom-6 size-40 -rotate-12 text-white/30 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
        />
        <span className="absolute top-4 left-4 grid size-12 place-items-center rounded-2xl bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm">
          <Icon className="size-6" strokeWidth={2.5} aria-hidden />
        </span>
        {soon && (
          <span className="absolute top-4 right-4">
            <Badge tone="neutral" icon={Lock}>
              Soon
            </Badge>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-2xl font-extrabold">{title}</h3>
        <p className="mt-1 text-night-300">{tagline}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-night-400">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4" strokeWidth={2.5} aria-hidden /> {players}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" strokeWidth={2.5} aria-hidden /> {length}
          </span>
        </div>
        <div className="mt-5 flex flex-1 items-end">
          {soon || !onPlay ? (
            <div className="flex h-11 w-full items-center justify-center rounded-2xl border-2 border-dashed border-white/10 font-display text-sm font-bold text-night-400">
              {soon ? 'In the workshop' : 'Board coming to the web'}
            </div>
          ) : (
            <button
              type="button"
              onClick={onPlay}
              className="press inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-(--seat) font-display font-bold text-night-950 [--press-depth:4px] [--press-edge:var(--seat-deep)] hover:brightness-105 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-400"
            >
              <Play className="size-4 fill-current" aria-hidden /> Play {title}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
