import { Handshake, LayoutList, RotateCcw, Trophy } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { Button } from '../../shared/ui/Button'
import { buttonStyles } from '../../shared/ui/buttonStyles'
import { Disc } from '../../shared/ui/Disc'
import { SEATS } from '../../shared/ui/seat'
import type { GameStatus } from '../../games/store'

type GameOverCardProps = {
  status: Extract<GameStatus, 'won' | 'lost' | 'draw'>
  opponentName: string
  onRematch: () => void
}

// Discs that burst out behind the card on a win.
const CONFETTI = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2
  return { x: Math.cos(angle) * 220, y: Math.sin(angle) * 160, seat: SEATS[i % SEATS.length], delay: (i % 4) * 0.04 }
})

/** Sits over the board once the game ends. */
export function GameOverCard({ status, opponentName, onRematch }: GameOverCardProps) {
  const first = opponentName.split(' ')[0]
  const copy = {
    won: { title: 'Victory!', body: `You beat ${first}.` },
    lost: { title: `${first} took it`, body: 'Run it back?' },
    draw: { title: 'Stalemate', body: 'Nobody blinked.' },
  }[status]

  return (
    <motion.div
      className="absolute inset-0 z-10 grid place-items-center rounded-[1.75rem] bg-night-950/55 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.3 }}
    >
      {status === 'won' &&
        CONFETTI.map((c, i) => (
          <motion.span
            key={i}
            className="absolute size-6"
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: c.x, y: c.y, scale: 1, opacity: 0, rotate: 180 }}
            transition={{ duration: 1.2, delay: 1 + c.delay, ease: 'easeOut' }}
          >
            <Disc seat={c.seat} className="size-full" />
          </motion.span>
        ))}

      <motion.div
        className="panel w-[min(20rem,calc(100%-2rem))] rounded-3xl p-6 text-center"
        initial={{ scale: 0.7, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.95 }}
      >
        <span
          className={
            status === 'won'
              ? 'mx-auto grid size-16 place-items-center rounded-2xl bg-linear-to-b from-gold to-gold-deep text-night-950 shadow-[0_4px_0_color-mix(in_oklab,var(--color-gold-deep)_70%,black),inset_0_2px_0_rgb(255_255_255/0.5)]'
              : 'mx-auto grid size-16 place-items-center rounded-2xl bg-night-700 text-night-100'
          }
        >
          {status === 'draw' ? <Handshake className="size-8" strokeWidth={2.25} /> : <Trophy className="size-8" strokeWidth={2.25} />}
        </span>
        <h2 className="mt-4 text-3xl font-extrabold">{copy.title}</h2>
        <p className="mt-1 text-night-300">{copy.body}</p>
        <div className="mt-6 grid gap-2.5">
          <Button icon={RotateCcw} onClick={onRematch} className="w-full">
            Rematch
          </Button>
          <Link to="/my-games" className={buttonStyles({ variant: 'secondary', className: 'w-full' })}>
            <LayoutList strokeWidth={2.5} /> My games
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
