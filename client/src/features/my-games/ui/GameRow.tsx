import { ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { cn } from '../../../lib/cn'
import { timeAgo } from '../../../lib/time'
import { MiniBoard } from '../../connect4/ui/MiniBoard'
import { Avatar } from '../../shared/ui/Avatar'
import { Badge } from '../../shared/ui/Badge'
import { position, statusOf, type GameRecord, type GameStatus } from '../../games/store'

const BADGE: Record<GameStatus, { label: string; tone: 'brand' | 'neutral' | 'lime' | 'tangerine' | 'sun'; live?: boolean }> = {
  'your-turn': { label: 'Your turn', tone: 'brand', live: true },
  'their-turn': { label: 'Their turn', tone: 'neutral' },
  won: { label: 'Won', tone: 'lime' },
  lost: { label: 'Lost', tone: 'tangerine' },
  draw: { label: 'Draw', tone: 'sun' },
}

function lastActivity(game: GameRecord) {
  const last = game.moves.at(-1)
  if (game.resignedBy !== null) {
    const who = game.seats[game.resignedBy]
    return `${who.isYou ? 'You' : who.name.split(' ')[0]} resigned`
  }
  if (!last) return 'No moves yet'
  const who = game.seats[last.seat]
  return `${who.isYou ? 'You' : who.name.split(' ')[0]} played column ${last.column + 1}`
}

/** One game in "My games": the board at a glance, who, and whose move. */
export function GameRow({ game }: { game: GameRecord }) {
  const status = statusOf(game)
  const badge = BADGE[status]
  const opponent = game.seats.find((s) => !s.isYou)!

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
    >
      <Link
        to={`/games/connect-4/${game.id}`}
        className={cn(
          'group flex items-center gap-4 rounded-2xl p-3 pr-4 transition-colors sm:gap-5',
          status === 'your-turn'
            ? 'bg-brand-500/8 ring-1 ring-brand-500/40 hover:bg-brand-500/12'
            : 'bg-white/3 ring-1 ring-white/6 hover:bg-white/6',
        )}
      >
        <MiniBoard position={position(game)} colors={game.seats.map((s) => s.color)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Avatar name={opponent.name} seat={opponent.color} size="sm" />
            <span className="truncate font-bold">{opponent.name}</span>
          </div>
          <div className="mt-1 truncate text-sm text-night-400">
            Connect 4 · {lastActivity(game)} · {timeAgo(game.updatedAt)}
          </div>
        </div>
        <Badge tone={badge.tone} live={badge.live}>
          {badge.label}
        </Badge>
        <ChevronRight
          className="hidden size-5 text-night-500 transition-transform group-hover:translate-x-0.5 sm:block"
          aria-hidden
        />
      </Link>
    </motion.div>
  )
}
