import { BookOpen, Play, Trophy } from 'lucide-react'
import { motion } from 'motion/react'
import { Badge } from '../../shared/ui/Badge'
import { Button } from '../../shared/ui/Button'
import { EASE_OUT } from '../../shared/ui/motion'
import { useNavigate } from 'react-router'
import { Connect4Preview } from './Connect4Preview'

/** Game of the week: rules up front, with the board replaying beside them. */
export function FeaturedGame() {
  const navigate = useNavigate()
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.2 }}
      className="relative isolate grid items-center gap-10 overflow-hidden rounded-[2.5rem] bg-night-900 p-8 ring-1 ring-white/6 sm:p-12 lg:grid-cols-[1fr_0.9fr]"
    >
      <div aria-hidden className="absolute -right-20 -bottom-40 -z-10 size-[32rem] rounded-full bg-brand-600/35 blur-[120px]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(rgb(255_255_255/0.07)_1.5px,transparent_1.5px)] bg-size-[26px_26px] mask-[radial-gradient(ellipse_at_80%_60%,black_20%,transparent_70%)]"
      />

      <div>
        <Badge tone="gold" icon={Trophy}>
          Most played this week
        </Badge>
        <h2 className="mt-5 text-5xl leading-none font-extrabold sm:text-6xl">Connect 4</h2>
        <p className="mt-4 max-w-md text-lg text-night-300">
          Take turns dropping discs into a 7×6 grid. They fall to the lowest open slot. First to line up four in a row,
          across, down or diagonally, wins.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" icon={Play} onClick={() => navigate('/games/connect-4')}>
            Play now
          </Button>
          <Button size="lg" variant="secondary" icon={BookOpen}>
            How to play
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm pt-16 lg:max-w-md" aria-hidden>
        <div className="-rotate-3">
          <Connect4Preview />
        </div>
      </div>
    </motion.section>
  )
}
