import { ArrowRight, Check, Flame, LogIn, Ship } from 'lucide-react'
import { motion, useScroll, useTransform } from 'motion/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Avatar } from '../../shared/ui/Avatar'
import { Badge } from '../../shared/ui/Badge'
import { buttonStyles } from '../../shared/ui/buttonStyles'
import { Currency } from '../../shared/ui/Currency'
import type { Seat } from '../../shared/ui/seat'
import { Connect4Preview } from '../../games/ui/Connect4Preview'
import { EASE_OUT, popIn, rise, stagger } from '../../shared/ui/motion'

const PLAYERS: [string, Seat][] = [
  ['Ada Lovelace', 'sky'],
  ['Grace Hopper', 'sun'],
  ['Linus T', 'lime'],
  ['Barbara L', 'tangerine'],
]

const word = {
  hidden: { opacity: 0, y: 48, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE_OUT } },
}

function FloatingCard({ className, delay, children }: { className: string; delay: number; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, delay }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.6 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export function Hero() {
  const { scrollY } = useScroll()
  const boardY = useTransform(scrollY, [0, 700], [0, -70])
  const cardsY = useTransform(scrollY, [0, 700], [0, 50])

  return (
    <section className="relative isolate overflow-hidden">
      {/* Backdrop: dot grid and red glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(rgb(255_255_255/0.08)_1.5px,transparent_1.5px)] bg-size-[28px_28px] mask-[radial-gradient(ellipse_70%_60%_at_70%_40%,black,transparent)]"
      />
      <motion.div
        aria-hidden
        className="absolute top-10 right-[-10%] -z-10 size-[42rem] rounded-full bg-brand-600/30 blur-[140px]"
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 pt-16 pb-24 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:pt-24">
        <motion.div variants={stagger(0.12, 0.2)} initial="hidden" animate="show">
          <motion.div variants={popIn}>
            <Badge tone="brand" live>
              1,204 games in play
            </Badge>
          </motion.div>

          <motion.h1
            variants={stagger(0.09)}
            className="mt-7 text-6xl leading-[0.95] font-extrabold tracking-tighter sm:text-7xl xl:text-8xl"
          >
            {['Your', 'move.'].map((w) => (
              <motion.span key={w} variants={word} className="mr-[0.22em] inline-block">
                {w}
              </motion.span>
            ))}
            <br />
            <motion.span variants={word} className="inline-block text-brand-500">
              Whenever.
            </motion.span>
          </motion.h1>

          <motion.p variants={rise} className="mt-7 max-w-lg text-lg text-night-300 sm:text-xl">
            Challenge friends to classic board games, from Connect 4 to Battleship and more. Take your turn now,
            tomorrow, or next week. The game waits.
          </motion.p>

          <motion.div variants={rise} className="mt-10 flex flex-wrap gap-4">
            <Link to="/register" className={buttonStyles({ size: 'lg', className: 'group' })}>
              Start playing
              <ArrowRight className="transition-transform group-hover:translate-x-1" strokeWidth={2.75} />
            </Link>
            <Link to="/login" className={buttonStyles({ size: 'lg', variant: 'secondary' })}>
              <LogIn strokeWidth={2.5} /> Log in
            </Link>
          </motion.div>

          <motion.div variants={rise} className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {PLAYERS.map(([name, seat]) => (
                <Avatar key={name} name={name} seat={seat} size="md" />
              ))}
            </div>
            <div className="text-sm leading-tight">
              <div className="font-bold">8,400+ players</div>
              <div className="text-night-400">waiting on your move</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scene */}
        <div className="relative mx-auto w-full max-w-lg pt-16" aria-hidden>
          <motion.div
            style={{ y: boardY }}
            initial={{ opacity: 0, rotate: -14, scale: 0.9 }}
            animate={{ opacity: 1, rotate: -5, scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.3 }}
          >
            <Connect4Preview />
            <div className="mt-8 flex justify-center">
              <span className="rounded-full bg-night-900/80 px-3 py-1 text-xs font-bold tracking-wide text-night-300 uppercase ring-1 ring-white/8">
                Connect 4 · live replay
              </span>
            </div>
          </motion.div>

          <motion.div style={{ y: cardsY }} className="pointer-events-none absolute inset-0">
            <FloatingCard className="absolute top-4 -left-6 sm:-left-16" delay={1.4}>
              <div className="panel flex items-center gap-3 rounded-2xl p-3 pr-5">
                <Avatar name="Grace Hopper" seat="sun" size="sm" />
                <div className="text-sm leading-tight">
                  <div className="font-bold">Grace moved</div>
                  <div className="text-night-300">Your turn · Connect 4</div>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard className="absolute -right-2 bottom-6 sm:-right-12" delay={2.1}>
              <div className="panel w-60 rounded-2xl p-3.5">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky/15 text-sky ring-1 ring-sky/30">
                    <Ship className="size-5" strokeWidth={2.5} />
                  </span>
                  <div className="text-sm leading-tight">
                    <div className="font-bold">Linus invited you</div>
                    <div className="text-night-300">Battleship · 2 players</div>
                  </div>
                </div>
                <div className="mt-3 flex h-8 items-center justify-center gap-1.5 rounded-xl bg-lime font-display text-sm font-bold text-night-950 shadow-[0_3px_0_var(--color-lime-deep)]">
                  <Check className="size-4" strokeWidth={3} /> Accept
                </div>
              </div>
            </FloatingCard>

            <FloatingCard className="absolute top-0 right-4" delay={2.6}>
              <Currency icon={Flame} value={7} />
            </FloatingCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
