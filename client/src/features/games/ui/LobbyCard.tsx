import { X } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Avatar } from '../../shared/ui/Avatar'
import { Button } from '../../shared/ui/Button'
import type { SeatInfo } from '../store'

type LobbyCardProps = {
  invitee: SeatInfo
  /** The game's settings, as chips. */
  summary?: ReactNode
  onCancel: () => void
}

/** Over the board while the invite is out: who we're waiting on, and a way to call it off. */
export function LobbyCard({ invitee, summary, onCancel }: LobbyCardProps) {
  const first = invitee.name.split(' ')[0]
  return (
    <motion.div
      className="absolute inset-0 z-10 grid place-items-center rounded-[1.75rem] bg-night-950/60 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="panel w-[min(22rem,calc(100%-2rem))] rounded-3xl p-6 text-center"
        initial={{ scale: 0.85, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Radar rings around the invitee */}
        <div className="relative mx-auto grid size-24 place-items-center">
          {[0, 1].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border-2 border-sun/60"
              animate={{ scale: [0.7, 1.5], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i, ease: 'easeOut' }}
            />
          ))}
          <Avatar name={invitee.name} seat={invitee.color} size="lg" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold">Waiting for {first}</h2>
        <p className="mt-1 text-night-300">
          Invite sent{invitee.username && <span className="font-mono text-night-400"> to @{invitee.username}</span>}.
          The game starts as soon as they accept.
        </p>
        {summary && <div className="mt-4 flex flex-wrap justify-center gap-1.5">{summary}</div>}
        <Button variant="secondary" icon={X} onClick={onCancel} className="mt-6 w-full">
          Cancel invite
        </Button>
      </motion.div>
    </motion.div>
  )
}
