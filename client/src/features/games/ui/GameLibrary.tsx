import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '../../../lib/cn'
import { EASE_OUT } from '../../shared/ui/motion'
import { GAMES, type Game } from '../catalog'
import { GameCard } from './GameCard'

const FILTERS: { id: string; label: string; match: (g: Game) => boolean }[] = [
  { id: 'all', label: 'All games', match: () => true },
  { id: 'strategy', label: 'Strategy', match: (g) => g.category === 'strategy' },
  { id: 'quick', label: 'Quick', match: (g) => g.category === 'quick' },
  { id: 'party', label: 'Groups', match: (g) => g.category === 'party' },
  { id: 'soon', label: 'Coming soon', match: (g) => g.status === 'soon' },
]

/** Filter pills and the grid of game cards. */
export function GameLibrary() {
  const [filter, setFilter] = useState('all')
  const active = FILTERS.find((f) => f.id === filter) ?? FILTERS[0]
  const games = GAMES.filter(active.match)

  return (
    <section>
      <div className="mt-16 mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter games">
        {FILTERS.map((f) => {
          const selected = f.id === filter
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(f.id)}
              className={cn(
                'relative isolate h-10 rounded-full px-4 font-display text-sm font-bold transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
                selected ? 'text-white' : 'text-night-300 hover:bg-white/6 hover:text-white',
              )}
            >
              {selected && (
                <motion.span
                  layoutId="games-filter"
                  className="absolute inset-0 -z-10 rounded-full bg-brand-500 shadow-[0_3px_0_var(--color-brand-800)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{f.label}</span>
            </button>
          )
        })}
      </div>

      {/* Each card owns its enter/exit, so cards added by a filter change
          animate in even though the grid itself mounted long ago. */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              layout
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
              transition={{
                layout: { type: 'spring', stiffness: 400, damping: 34 },
                default: { duration: 0.35, ease: EASE_OUT, delay: i * 0.03 },
              }}
            >
              <GameCard game={game} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {games.length === 0 && <div className="py-16 text-center text-night-400">No games match that filter yet.</div>}
    </section>
  )
}
