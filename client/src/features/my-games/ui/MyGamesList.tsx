import { Gamepad2, Plus, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '../../../lib/cn'
import { Button } from '../../shared/ui/Button'
import { EmptyState } from '../../shared/ui/EmptyState'
import { isFinished, statusOf, useGames, type GameRecord } from '../../games/store'
import { useStartConnect4 } from '../../games/useStartGame'
import { GameRow } from './GameRow'

const TABS: { id: string; label: string; match: (g: GameRecord) => boolean }[] = [
  { id: 'your-turn', label: 'Your turn', match: (g) => statusOf(g) === 'your-turn' },
  { id: 'their-turn', label: 'Their turn', match: (g) => statusOf(g) === 'their-turn' },
  { id: 'finished', label: 'Finished', match: (g) => isFinished(statusOf(g)) },
  { id: 'all', label: 'All', match: () => true },
]

/** Every game you're in, filterable by whose move it is and searchable by opponent. */
export function MyGamesList() {
  const games = useGames()
  const startGame = useStartConnect4()
  const [tab, setTab] = useState('your-turn')
  const [query, setQuery] = useState('')

  const active = TABS.find((t) => t.id === tab) ?? TABS[0]
  const q = query.trim().toLowerCase()
  const shown = [...games]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter(active.match)
    .filter((g) => !q || g.seats.some((s) => !s.isYou && s.name.toLowerCase().includes(q)))

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter games">
          {TABS.map((t) => {
            const selected = t.id === tab
            const count = games.filter(t.match).length
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative isolate inline-flex h-10 items-center gap-2 rounded-full px-4 font-display text-sm font-bold transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
                  selected ? 'text-white' : 'text-night-300 hover:bg-white/6 hover:text-white',
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="my-games-tab"
                    className="absolute inset-0 -z-10 rounded-full bg-brand-500 shadow-[0_3px_0_var(--color-brand-800)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {t.label}
                <span
                  className={cn(
                    'grid min-w-5 place-items-center rounded-full px-1.5 text-xs tabular-nums',
                    selected ? 'bg-white/20' : 'bg-white/8 text-night-400',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <label className="flex h-11 w-full items-center gap-3 rounded-2xl bg-night-900 px-4 shadow-[inset_0_2px_4px_rgb(0_0_0/0.45)] ring-2 ring-white/8 transition-shadow focus-within:ring-brand-500 md:w-72">
          <Search className="size-4.5 text-night-400" strokeWidth={2.5} aria-hidden />
          <span className="sr-only">Search by opponent</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by opponent"
            className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-night-500"
          />
        </label>
      </div>

      {shown.length > 0 ? (
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((game) => (
              <GameRow key={game.id} game={game} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={Gamepad2}
          title={q ? 'No games with that player' : tab === 'your-turn' ? "You're all caught up" : 'Nothing here yet'}
          action={
            <Button icon={Plus} onClick={startGame}>
              New game
            </Button>
          }
        >
          {q
            ? 'Try another name, or start a fresh game.'
            : tab === 'your-turn'
              ? "It's nobody's move but theirs. Start another game while you wait."
              : 'Start a game and it will show up here.'}
        </EmptyState>
      )}
    </div>
  )
}
