import { Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { buttonStyles } from '../../shared/ui/buttonStyles'
import { rise, stagger } from '../../shared/ui/motion'
import { statusOf, useGames } from '../../games/store'

export function MyGamesHeader() {
  const games = useGames()
  const yourTurn = games.filter((g) => statusOf(g) === 'your-turn').length

  return (
    <motion.header
      variants={stagger(0.08)}
      initial="hidden"
      animate="show"
      className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"
    >
      <div>
        <motion.div
          variants={rise}
          className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-brand-400 uppercase"
        >
          <span className="h-0.5 w-6 rounded-full bg-brand-500" />
          My games
        </motion.div>
        <motion.h1 variants={rise} className="mt-3 text-5xl font-extrabold sm:text-6xl">
          {yourTurn > 0 ? (
            <>
              <span className="text-brand-500">{yourTurn}</span> waiting on you.
            </>
          ) : (
            'All caught up.'
          )}
        </motion.h1>
        <motion.p variants={rise} className="mt-3 text-lg text-night-300">
          Every game you've started, right where you left it.
        </motion.p>
      </div>
      <motion.div variants={rise}>
        <Link to="/games" className={buttonStyles({ size: 'lg' })}>
          <Plus strokeWidth={2.5} /> New game
        </Link>
      </motion.div>
    </motion.header>
  )
}
