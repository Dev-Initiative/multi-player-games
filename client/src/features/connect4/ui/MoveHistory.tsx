import { History } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { timeAgo } from '../../../lib/time'
import { Disc } from '../../shared/ui/Disc'
import { Panel } from '../../shared/ui/Panel'
import type { GameRecord } from '../../games/store'

/** The move log, newest first. This is the game's source of truth. */
export function MoveHistory({ game }: { game: GameRecord }) {
  const moves = [...game.moves].reverse()
  const first = game.seats[game.firstSeat]

  return (
    <Panel className="p-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-bold tracking-widest text-night-400 uppercase">Moves</h2>
        <span className="font-mono text-xs text-night-500">{game.moves.length} played</span>
      </div>

      {moves.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-night-400">
          <History className="size-6" strokeWidth={2.25} />
          No moves yet. {first.isYou ? 'You go' : `${first.name} goes`} first.
        </div>
      ) : (
        <ol className="max-h-72 space-y-1 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {moves.map((move) => {
              const seat = game.seats[move.seat]
              return (
                <motion.li
                  key={move.seq}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm odd:bg-white/3"
                >
                  <span className="w-6 font-mono text-xs text-night-500">{move.seq}</span>
                  <Disc seat={seat.color} className="size-4" />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-semibold">{seat.isYou ? 'You' : seat.name.split(' ')[0]}</span>
                    <span className="text-night-400"> · column {move.column + 1}</span>
                  </span>
                  <span className="shrink-0 text-xs text-night-500">{timeAgo(move.at)}</span>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ol>
      )}
    </Panel>
  )
}
