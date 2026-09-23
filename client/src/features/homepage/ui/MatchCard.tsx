import { ChevronRight, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '../../../lib/cn'
import { Avatar } from '../../shared/ui/Avatar'
import { Badge } from '../../shared/ui/Badge'
import { seatVars, type Seat } from '../../shared/ui/seat'
import { rise } from '../../shared/ui/motion'

type MatchStatus = 'your-turn' | 'waiting' | 'won' | 'lobby'

type MatchCardProps = {
  game: string
  icon: LucideIcon
  seat: Seat
  players: { name: string; seat: Seat }[]
  status: MatchStatus
  lastMove: string
}

const STATUS: Record<MatchStatus, { label: string; tone: 'brand' | 'neutral' | 'lime' | 'sun'; live?: boolean }> = {
  'your-turn': { label: 'Your turn', tone: 'brand', live: true },
  waiting: { label: 'Waiting', tone: 'neutral' },
  won: { label: 'You won', tone: 'lime' },
  lobby: { label: 'In lobby', tone: 'sun' },
}

/** One game in a player's list: what it is, who's in it, whose move. */
export function MatchCard({ game, icon: Icon, seat, players, status, lastMove }: MatchCardProps) {
  const { label, tone, live } = STATUS[status]
  return (
    <motion.div
      variants={rise}
      whileHover={{ x: 4 }}
      style={seatVars(seat)}
      className={cn(
        'group flex items-center gap-4 rounded-2xl p-3 pr-4 transition-colors',
        status === 'your-turn' ? 'bg-brand-500/8 ring-1 ring-brand-500/40' : 'bg-white/3 ring-1 ring-white/6 hover:bg-white/5',
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-linear-to-br from-(--seat) to-(--seat-deep) text-white shadow-[inset_0_2px_0_rgb(255_255_255/0.3)]">
        <Icon className="size-6" strokeWidth={2.5} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-bold">{game}</div>
        <div className="truncate text-sm text-night-400">{lastMove}</div>
      </div>
      <div className="hidden -space-x-2 sm:flex">
        {players.map((p) => (
          <Avatar key={p.name} name={p.name} seat={p.seat} size="sm" />
        ))}
      </div>
      <Badge tone={tone} live={live}>
        {label}
      </Badge>
      <ChevronRight className="size-5 text-night-500 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </motion.div>
  )
}
