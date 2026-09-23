import { History } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../../../lib/cn'
import { timeAgo } from '../../../lib/time'
import { Panel } from '../../shared/ui/Panel'
import type { GameRecord, MoveEntry } from '../store'

type MoveTimelineProps = {
  game: GameRecord
  piece: (seat: number, className?: string) => ReactNode
  /** What a move did, e.g. "column 4" or "B2–C2 · +1 box". */
  describe: (move: MoveEntry, index: number) => ReactNode
}

/** The move log as a timeline, newest on top. This is the game's source of truth. */
export function MoveTimeline({ game, piece, describe }: MoveTimelineProps) {
  const first = game.seats[game.firstSeat]
  const moves = game.moves.map((move, index) => ({ move, index })).reverse()
  const who = (seat: number) => (game.seats[seat].isYou ? 'You' : game.seats[seat].name.split(' ')[0])

  return (
    <Panel className="overflow-hidden p-0 sm:p-0">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-sm font-bold tracking-widest text-night-400 uppercase">Timeline</h2>
        <span className="rounded-full bg-white/6 px-2 py-0.5 font-mono text-xs text-night-400">
          {game.moves.length} moves
        </span>
      </div>

      {moves.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-sm text-night-400">
          <History className="size-6" strokeWidth={2.25} />
          No moves yet. {first.isYou ? 'You go' : `${first.name} goes`} first.
        </div>
      ) : (
        <ol className="relative max-h-[26rem] overflow-y-auto px-5 pb-4">
          {/* The spine */}
          <span aria-hidden className="absolute top-2 bottom-6 left-[2.05rem] w-px bg-white/8" />
          <AnimatePresence initial={false}>
            {moves.map(({ move, index }, i) => (
              <motion.li
                key={move.seq}
                layout
                initial={{ opacity: 0, x: -12, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="relative flex items-start gap-3 py-1.5"
              >
                <span
                  className={cn(
                    'relative z-10 grid size-7 shrink-0 place-items-center rounded-full bg-night-900 ring-2',
                    i === 0 ? 'ring-white/30' : 'ring-night-900',
                  )}
                >
                  {piece(move.seat, 'size-4')}
                </span>
                <div className={cn('min-w-0 flex-1 rounded-xl px-3 py-1.5 text-sm', i === 0 && 'bg-white/5')}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-bold">{who(move.seat)}</span>
                    <span className="shrink-0 font-mono text-[10px] text-night-600">#{move.seq}</span>
                  </div>
                  <div className="truncate text-night-400">{describe(move, index)}</div>
                  {i === 0 && <div className="mt-0.5 text-xs text-night-500">{timeAgo(move.at)}</div>}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}

      <dl className="grid grid-cols-2 gap-px border-t border-white/6 bg-white/6 text-sm">
        <div className="bg-night-900 px-5 py-3">
          <dt className="text-xs text-night-500">Started</dt>
          <dd className="font-semibold">{timeAgo(game.createdAt)}</dd>
        </div>
        <div className="bg-night-900 px-5 py-3">
          <dt className="text-xs text-night-500">First move</dt>
          <dd className="truncate font-semibold">{who(game.firstSeat)}</dd>
        </div>
      </dl>
    </Panel>
  )
}
