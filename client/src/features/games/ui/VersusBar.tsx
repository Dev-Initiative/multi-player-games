import { ChevronLeft, Crown } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../../../lib/cn'
import { Avatar } from '../../shared/ui/Avatar'
import { seatVars } from '../../shared/ui/seat'
import { isFinished, type GameRecord, type GameStatus } from '../store'

type VersusBarProps = {
  game: GameRecord
  status: GameStatus
  you: number
  opponent: number
  currentSeat: number | null
  winner: number | null
  piece: (seat: number, className?: string) => ReactNode
  /** A running score, for games that keep one. Without it the plates show pieces. */
  score?: (seat: number) => number
}

type PlateProps = Omit<VersusBarProps, 'you' | 'opponent'> & { seat: number; side: 'left' | 'right' }

function Plate({ game, status, seat, side, currentSeat, winner, piece, score }: PlateProps) {
  const info = game.seats[seat]
  const toMove = currentSeat === seat
  const won = winner === seat
  const name = info.isYou ? 'You' : info.name
  const invite = info.invite ?? 'accepted'
  const subtitle =
    status === 'lobby'
      ? invite === 'pending'
        ? 'Invite sent'
        : 'Ready'
      : status === 'cancelled'
        ? invite === 'declined'
          ? 'Declined'
          : '—'
        : won
          ? 'Winner'
          : toMove
            ? info.isYou
              ? 'Your move'
              : 'Thinking…'
            : isFinished(status)
              ? game.resignedBy === seat
                ? 'Resigned'
                : '—'
              : 'Waiting'
  const lit = toMove || won || isFinished(status) || (status === 'lobby' && invite === 'accepted')

  return (
    <motion.div
      style={seatVars(info.color)}
      animate={{ scale: toMove ? 1 : 0.97, opacity: lit ? 1 : 0.6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'relative flex min-w-0 items-center gap-3 overflow-hidden rounded-3xl p-3 sm:p-4',
        side === 'right' && 'flex-row-reverse text-right',
        toMove || won ? 'bg-(--seat)/10 ring-2 ring-(--seat)/60' : 'bg-night-900 ring-1 ring-white/6',
      )}
    >
      <div className="relative shrink-0">
        <Avatar name={name} seat={info.color} size="lg" active={toMove} />
        {won && (
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: side === 'left' ? -15 : 15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.8 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-gold drop-shadow-[0_2px_0_var(--color-gold-deep)]"
          >
            <Crown className="size-6 fill-gold" strokeWidth={2} />
          </motion.span>
        )}
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate font-display text-lg font-extrabold">{name}</div>
        <div className={cn('truncate text-sm font-semibold', toMove || won ? 'text-(--seat)' : 'text-night-500')}>
          {subtitle}
        </div>
      </div>
      {score ? (
        <motion.span
          key={score(seat)}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className="font-display text-4xl font-extrabold text-(--seat) tabular-nums sm:text-5xl"
        >
          {score(seat)}
        </motion.span>
      ) : (
        <span className="hidden sm:block">{piece(seat, 'size-9')}</span>
      )}

      {/* "Thinking" shimmer along the bottom edge */}
      {toMove && !info.isYou && (
        <motion.span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-transparent via-(--seat) to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  )
}

/** You on the left, them on the right, and an arrow that swings to whoever's move it is. */
export function VersusBar(props: VersusBarProps) {
  const { you, opponent, currentSeat, game } = props
  const pointsLeft = currentSeat === you

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
      <Plate {...props} seat={you} side="left" />
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-sm font-extrabold tracking-widest text-night-500">VS</span>
        {currentSeat !== null ? (
          <motion.span
            animate={{ rotate: pointsLeft ? 0 : 180 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="grid size-8 place-items-center rounded-full bg-night-800 text-white ring-1 ring-white/10"
            aria-label={pointsLeft ? 'Your move' : 'Their move'}
          >
            <ChevronLeft className="size-5" strokeWidth={3} />
          </motion.span>
        ) : (
          <span className="size-8" />
        )}
        <span className="font-mono text-[10px] text-night-600">#{game.moves.length}</span>
      </div>
      <Plate {...props} seat={opponent} side="right" />
    </div>
  )
}
