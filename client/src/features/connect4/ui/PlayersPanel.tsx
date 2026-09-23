import { cn } from '../../../lib/cn'
import { Avatar } from '../../shared/ui/Avatar'
import { Disc } from '../../shared/ui/Disc'
import { Panel } from '../../shared/ui/Panel'
import { seatVars } from '../../shared/ui/seat'
import type { GameRecord } from '../../games/store'

type PlayersPanelProps = {
  game: GameRecord
  currentSeat: number | null
  winner: number | null
}

export function PlayersPanel({ game, currentSeat, winner }: PlayersPanelProps) {
  return (
    <Panel className="space-y-2.5 p-4">
      <h2 className="mb-1 px-1 text-sm font-bold tracking-widest text-night-400 uppercase">Players</h2>
      {game.seats.map((seat, i) => {
        const toMove = currentSeat === i
        const discs = game.moves.filter((m) => m.seat === i).length
        return (
          <div
            key={i}
            style={seatVars(seat.color)}
            className={cn(
              'flex items-center gap-3 rounded-2xl p-2.5 pr-4 transition-colors',
              toMove ? 'bg-(--seat)/10 ring-2 ring-(--seat)/60' : 'bg-white/3 ring-1 ring-white/6',
            )}
          >
            <Avatar name={seat.isYou ? 'You' : seat.name} seat={seat.color} active={toMove} />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate font-bold">
                {seat.isYou ? 'You' : seat.name}
                {game.firstSeat === i && <span className="ml-2 text-xs font-semibold text-night-400">went first</span>}
              </div>
              <div className={cn('text-sm', toMove ? 'font-semibold text-(--seat)' : 'text-night-400')}>
                {winner === i ? 'Winner' : toMove ? 'To move' : `${discs} disc${discs === 1 ? '' : 's'} played`}
              </div>
            </div>
            <Disc seat={seat.color} className="size-7" />
          </div>
        )
      })}
    </Panel>
  )
}
