import { cn } from '../../../lib/cn'
import { Avatar } from './Avatar'
import { seatVars, type Seat } from './seat'

type PlayerRowProps = {
  name: string
  seat: Seat
  score: number
  active?: boolean
  status?: string
}

export function PlayerRow({ name, seat, score, active, status }: PlayerRowProps) {
  return (
    <div
      style={seatVars(seat)}
      className={cn(
        'flex items-center gap-3 rounded-2xl p-2.5 pr-4 transition-colors',
        active ? 'bg-(--seat)/12 ring-2 ring-(--seat)/70' : 'bg-white/4 ring-1 ring-white/6',
      )}
    >
      <Avatar name={name} seat={seat} active={active} />
      <div className="min-w-0 leading-tight">
        <div className="truncate font-bold">{name}</div>
        <div className={cn('text-sm', active ? 'font-semibold text-(--seat)' : 'text-night-300')}>
          {active ? 'Their move' : (status ?? 'Waiting')}
        </div>
      </div>
      <div className="ml-auto font-display text-3xl font-extrabold tabular-nums">{score}</div>
    </div>
  )
}
