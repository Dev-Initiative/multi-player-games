import { motion } from 'motion/react'
import { rise, stagger } from '../../shared/ui/motion'

export function MyGamesHeader() {
  return (
    <motion.header variants={stagger(0.08)} initial="hidden" animate="show" className="mb-10">
      <motion.div
        variants={rise}
        className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-brand-400 uppercase"
      >
        <span className="h-0.5 w-6 rounded-full bg-brand-500" />
        My games
      </motion.div>
      <motion.h1 variants={rise} className="mt-3 text-5xl font-extrabold sm:text-6xl">
        Your games.
      </motion.h1>
      <motion.p variants={rise} className="mt-3 text-lg text-night-300">
        Games you've started will show up here.
      </motion.p>
    </motion.header>
  )
}
