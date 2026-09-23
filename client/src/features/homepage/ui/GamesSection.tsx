import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { GAMES, LIVE_GAMES } from '../../games/catalog'
import { GameTile } from '../../shared/ui/GameTile'
import { inView, rise, stagger } from '../../shared/ui/motion'
import { SectionHeading } from './SectionHeading'

const SOON = GAMES.length - LIVE_GAMES.length

export function GamesSection() {
  return (
    <section id="games" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-28 sm:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading kicker="The games" title="Classic games. One table.">
          Simple rules, endless rematches. Every game runs on the same engine, and the library keeps growing.
        </SectionHeading>
        <Link
          to="/games"
          className="group inline-flex shrink-0 items-center gap-2 font-display font-bold text-brand-400 hover:text-brand-300"
        >
          Browse all games
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" strokeWidth={2.75} />
        </Link>
      </div>

      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-5"
      >
        {LIVE_GAMES.map((game) => (
          <motion.div
            key={game.id}
            variants={rise}
            whileHover={{ y: -8, rotate: -1.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          >
            <GameTile title={game.title} players={game.players} icon={game.icon} seat={game.seat} />
          </motion.div>
        ))}

        <motion.div variants={rise} whileHover={{ y: -8 }} className="col-span-2 lg:col-span-1">
          <Link
            to="/games"
            className="group flex h-full min-h-40 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-white/12 p-6 text-center transition-colors hover:border-brand-500/60 hover:bg-brand-500/5"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/30 transition-transform group-hover:scale-110 group-hover:rotate-6">
              <Sparkles className="size-7" strokeWidth={2.25} aria-hidden />
            </span>
            <div>
              <div className="font-display text-xl font-extrabold">+{SOON} coming</div>
              <div className="text-sm text-night-400">Checkers, Chess, Reversi…</div>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
