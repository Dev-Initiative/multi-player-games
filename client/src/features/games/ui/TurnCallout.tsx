import { CircleSlash, Handshake, Send, Trophy } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../../../lib/cn'
import { seatVars, type Seat } from '../../shared/ui/seat'
import type { GameStatus, SeatInfo } from '../store'

type TurnCalloutProps = {
  status: GameStatus
  you: SeatInfo
  opponent: SeatInfo
  resigned: boolean
  piece: ReactNode
  /** Title for your turn; defaults to "Your move". */
  turnTitle?: string
  winDetail: string
  lossDetail: string
}

function Dots() {
  return (
    <span className="inline-flex gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-current"
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  )
}

/** A pill above the board saying what's happening right now. */
export function TurnCallout({
  status,
  you,
  opponent,
  resigned,
  piece,
  turnTitle = 'Your move',
  winDetail,
  lossDetail,
}: TurnCalloutProps) {
  const first = opponent.name.split(' ')[0]

  const pills: Record<GameStatus, { tone: Seat | 'gold' | null; icon: ReactNode; text: ReactNode }> = {
    'your-turn': {
      tone: you.color,
      icon: piece,
      text: turnTitle,
    },
    'their-turn': {
      tone: null,
      icon: null,
      text: (
        <span className="inline-flex items-center gap-2.5">
          {first} is thinking <Dots />
        </span>
      ),
    },
    won: {
      tone: 'gold',
      icon: <Trophy className="size-5" strokeWidth={2.5} />,
      text: resigned ? `${first} resigned. You win!` : `You win! ${winDetail}`,
    },
    lost: {
      tone: null,
      icon: null,
      text: resigned ? 'You resigned' : `${first} wins. ${lossDetail}`,
    },
    draw: {
      tone: null,
      icon: <Handshake className="size-5" strokeWidth={2.5} />,
      text: "It's a draw",
    },
    lobby: {
      tone: 'sun',
      icon: <Send className="size-5" strokeWidth={2.5} />,
      text: (
        <span className="inline-flex items-center gap-2.5">
          Waiting for {first} to accept <Dots />
        </span>
      ),
    },
    cancelled: {
      tone: null,
      icon: <CircleSlash className="size-5" strokeWidth={2.5} />,
      text: opponent.invite === 'declined' ? `${first} declined the invite` : 'Invite cancelled',
    },
  }
  const pill = pills[status]
  const tone = pill.tone
  return (
    <div className="flex min-h-12 justify-center" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${status}-${turnTitle}`}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          style={tone && tone !== 'gold' ? seatVars(tone) : undefined}
          className={cn(
            'inline-flex min-h-12 items-center gap-2.5 rounded-full px-5 py-2 text-center font-display text-lg leading-tight font-extrabold',
            tone === 'gold'
              ? 'bg-gold/15 text-gold ring-1 ring-gold/40'
              : tone
                ? 'bg-(--seat)/15 text-(--seat) ring-1 ring-(--seat)/40'
                : 'bg-night-800 text-night-100 ring-1 ring-white/8',
          )}
        >
          {pill.icon}
          {pill.text}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
