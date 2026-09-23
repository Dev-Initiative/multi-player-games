import { Search } from 'lucide-react'
import { motion } from 'motion/react'
import { rise, stagger } from '../../shared/ui/motion'
import { GAMES, LIVE_GAMES } from '../catalog'

export function GamesHeader() {
  return (
    <motion.header
      variants={stagger(0.08)}
      initial="hidden"
      animate="show"
      className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"
    >
      <div>
        <motion.div
          variants={rise}
          className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-brand-400 uppercase"
        >
          <span className="h-0.5 w-6 rounded-full bg-brand-500" />
          Game library
        </motion.div>
        <motion.h1 variants={rise} className="mt-3 text-5xl font-extrabold sm:text-6xl">
          Pick your game.
        </motion.h1>
        <motion.p variants={rise} className="mt-3 text-lg text-night-300">
          {LIVE_GAMES.length} ready to play, {GAMES.length - LIVE_GAMES.length} more on the way.
        </motion.p>
      </div>

      <motion.label
        variants={rise}
        className="flex h-13 w-full items-center gap-3 rounded-2xl bg-night-900 px-4 shadow-[inset_0_2px_4px_rgb(0_0_0/0.45)] ring-2 ring-white/8 transition-shadow focus-within:ring-brand-500 md:w-80"
      >
        <Search className="size-5 text-night-400" strokeWidth={2.5} aria-hidden />
        <span className="sr-only">Search games</span>
        <input
          type="search"
          placeholder="Search games"
          className="h-full min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:font-normal placeholder:text-night-500"
        />
        <kbd className="rounded-md bg-night-800 px-1.5 py-0.5 font-mono text-xs text-night-400 ring-1 ring-white/8">/</kbd>
      </motion.label>
    </motion.header>
  )
}
