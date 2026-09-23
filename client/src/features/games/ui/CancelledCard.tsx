import { CircleSlash, LayoutList, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { buttonStyles } from '../../shared/ui/buttonStyles'

type CancelledCardProps = {
  declinedBy?: string
  newGamePath: string
}

/** Over the board when a game ended before it began. */
export function CancelledCard({ declinedBy, newGamePath }: CancelledCardProps) {
  return (
    <motion.div
      className="absolute inset-0 z-10 grid place-items-center rounded-[1.75rem] bg-night-950/60 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="panel w-[min(20rem,calc(100%-2rem))] rounded-3xl p-6 text-center"
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-night-700 text-night-200">
          <CircleSlash className="size-7" strokeWidth={2.25} />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold">
          {declinedBy ? `${declinedBy.split(' ')[0]} passed` : 'Invite cancelled'}
        </h2>
        <p className="mt-1 text-night-300">
          {declinedBy ? 'They declined this one. Try someone else, or a different board.' : 'This game never started.'}
        </p>
        <div className="mt-6 grid gap-2.5">
          <Link to={newGamePath} className={buttonStyles({ className: 'w-full' })}>
            <Plus strokeWidth={2.5} /> New game
          </Link>
          <Link to="/my-games" className={buttonStyles({ variant: 'secondary', className: 'w-full' })}>
            <LayoutList strokeWidth={2.5} /> My games
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
