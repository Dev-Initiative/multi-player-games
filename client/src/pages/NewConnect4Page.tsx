import { ArrowLeft } from 'lucide-react'
import { motion, MotionConfig } from 'motion/react'
import { Link } from 'react-router'
import { Connect4Setup } from '../features/connect4/ui/Connect4Setup'
import { rise, stagger } from '../features/shared/ui/motion'
import { SiteFooter } from '../features/shared/ui/SiteFooter'
import { SiteNav } from '../features/shared/ui/SiteNav'

export function NewConnect4Page() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <SiteNav />
        <main className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-8">
          <motion.header variants={stagger(0.08)} initial="hidden" animate="show" className="mb-10">
            <motion.div variants={rise}>
              <Link to="/games" className="inline-flex items-center gap-1 text-sm font-semibold text-night-400 hover:text-white">
                <ArrowLeft className="size-4" /> All games
              </Link>
            </motion.div>
            <motion.h1 variants={rise} className="mt-4 text-5xl font-extrabold sm:text-6xl">
              New <span className="text-brand-500">Connect 4</span> game
            </motion.h1>
            <motion.p variants={rise} className="mt-3 text-lg text-night-300">
              Pick your opponent, set up the board, and send the invite.
            </motion.p>
          </motion.header>
          <Connect4Setup />
        </main>
        <SiteFooter />
      </div>
    </MotionConfig>
  )
}
