import { Handshake, Trophy } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Avatar } from '../../shared/ui/Avatar'
import { Disc } from '../../shared/ui/Disc'
import { seatVars } from '../../shared/ui/seat'
import type { SeatInfo, GameStatus } from '../../games/store'

type TurnBannerProps = {
  status: GameStatus
  you: SeatInfo
  opponent: SeatInfo
  resigned: boolean
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

function Row({ icon, title, detail }: { icon: ReactNode; title: ReactNode; detail: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      {icon}
      <div className="min-w-0">
        <div className="font-display text-3xl leading-tight font-extrabold sm:text-4xl">{title}</div>
        <div className="text-night-300">{detail}</div>
      </div>
    </div>
  )
}

/** What's happening right now, in one line. */
export function TurnBanner({ status, you, opponent, resigned }: TurnBannerProps) {
  const content = {
    'your-turn': (
      <Row
        icon={
          <span className="animate-glow rounded-full" style={seatVars(you.color)}>
            <Disc seat={you.color} className="size-12" />
          </span>
        }
        title="Your move"
        detail={
          <>
            Pick a column, or press <kbd className="rounded bg-night-800 px-1.5 font-mono text-xs">1</kbd>–
            <kbd className="rounded bg-night-800 px-1.5 font-mono text-xs">7</kbd>
          </>
        }
      />
    ),
    'their-turn': (
      <Row
        icon={<Avatar name={opponent.name} seat={opponent.color} size="lg" active />}
        title={
          <span className="inline-flex items-center gap-3">
            {opponent.name.split(' ')[0]} is thinking <Dots />
          </span>
        }
        detail="You'll get a notification when they move."
      />
    ),
    won: (
      <Row
        icon={
          <span className="grid size-12 place-items-center rounded-2xl bg-linear-to-b from-gold to-gold-deep text-night-950 shadow-[inset_0_2px_0_rgb(255_255_255/0.5)]">
            <Trophy className="size-6" strokeWidth={2.5} />
          </span>
        }
        title={<span className="text-gold">You win!</span>}
        detail={resigned ? `${opponent.name} resigned.` : 'Four in a row. Nicely done.'}
      />
    ),
    lost: (
      <Row
        icon={<Avatar name={opponent.name} seat={opponent.color} size="lg" />}
        title={`${opponent.name.split(' ')[0]} wins`}
        detail={resigned ? 'You resigned this one.' : 'They lined up four. Rematch?'}
      />
    ),
    draw: (
      <Row
        icon={
          <span className="grid size-12 place-items-center rounded-2xl bg-night-700 text-night-100">
            <Handshake className="size-6" strokeWidth={2.5} />
          </span>
        }
        title="It's a draw"
        detail="The board is full and nobody connected four."
      />
    ),
  }[status]

  return (
    <div className="min-h-20" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
