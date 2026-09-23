import { ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { cn } from '../../../lib/cn'
import { timeAgo } from '../../../lib/time'
import { replay as replayConnect4 } from '../../connect4/rules'
import { MiniBoard } from '../../connect4/ui/MiniBoard'
import { edgeName, replay as replayDots } from '../../dots/rules'
import { DotsMiniBoard } from '../../dots/ui/DotsMiniBoard'
import { GAMES } from '../../games/catalog'
import { STATUS_BADGE } from '../../games/statusBadge'
import { connect4Config, gamePath, phaseOf, statusOf, type GameRecord } from '../../games/store'
import { Avatar } from '../../shared/ui/Avatar'
import { Badge } from '../../shared/ui/Badge'

const who = (game: GameRecord, seat: number) => {
  const s = game.seats[seat]
  return s.isYou ? 'You' : s.name.split(' ')[0]
}

function lastActivity(game: GameRecord) {
  const phase = phaseOf(game)
  const invitee = game.seats.find((s) => !s.isYou)
  if (phase === 'lobby') return `Waiting for ${invitee?.name.split(' ')[0]} to accept`
  if (phase === 'cancelled')
    return game.seats.some((s) => s.invite === 'declined') ? `${invitee?.name.split(' ')[0]} declined` : 'Invite cancelled'
  if (game.resignedBy !== null) return `${who(game, game.resignedBy)} resigned`
  const last = game.moves.at(-1)
  if (!last) return 'No moves yet'
  return game.type === 'connect-4'
    ? `${who(game, last.seat)} played column ${last.move + 1}`
    : `${who(game, last.seat)} drew ${edgeName(last.move)}`
}

function Thumbnail({ game }: { game: GameRecord }) {
  const colors = game.seats.map((s) => s.color)
  const moves = game.moves.map((m) => m.move)
  return game.type === 'connect-4' ? (
    <MiniBoard position={replayConnect4(moves, game.firstSeat, connect4Config(game))} colors={colors} />
  ) : (
    <DotsMiniBoard position={replayDots(moves, game.firstSeat, game.seats.length)} colors={colors} />
  )
}

/** One game in "My games": the board at a glance, who, and whose move. */
export function GameRow({ game }: { game: GameRecord }) {
  const status = statusOf(game)
  const badge = STATUS_BADGE[status]
  const opponent = game.seats.find((s) => !s.isYou)!
  const title = GAMES.find((g) => g.id === game.type)?.title

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
    >
      <Link
        to={gamePath(game)}
        className={cn(
          'group flex items-center gap-4 rounded-2xl p-3 pr-4 transition-colors sm:gap-5',
          status === 'your-turn'
            ? 'bg-brand-500/8 ring-1 ring-brand-500/40 hover:bg-brand-500/12'
            : 'bg-white/3 ring-1 ring-white/6 hover:bg-white/6',
        )}
      >
        <Thumbnail game={game} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Avatar name={opponent.name} seat={opponent.color} size="sm" />
            <span className="truncate font-bold">{opponent.name}</span>
          </div>
          <div className="mt-1 truncate text-sm text-night-400">
            {title} · {lastActivity(game)} · {timeAgo(game.updatedAt)}
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
