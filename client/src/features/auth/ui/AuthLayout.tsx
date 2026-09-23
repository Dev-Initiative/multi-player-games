import { Clock, Gamepad2, Quote, Sparkles, UserPlus, type LucideIcon } from 'lucide-react'
import { motion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Avatar } from '../../shared/ui/Avatar'
import { Badge } from '../../shared/ui/Badge'
import { EASE_OUT } from '../../shared/ui/motion'
import type { Seat } from '../../shared/ui/seat'
import { GameWall } from './GameWall'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

const FEATURES: [LucideIcon, string][] = [
  [UserPlus, 'Invite by username'],
  [Clock, 'Games wait for days'],
  [Sparkles, 'New games added often'],
]

const PLAYERS: [string, Seat][] = [
  ['Ada Lovelace', 'sky'],
  ['Grace Hopper', 'sun'],
  ['Linus T', 'lime'],
  ['Barbara L', 'tangerine'],
]

function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 font-display text-lg font-extrabold">
      <span className="grid size-10 place-items-center rounded-xl bg-brand-500 text-white shadow-[0_3px_0_var(--color-brand-800),inset_0_1px_0_rgb(255_255_255/0.3)]">
        <Gamepad2 className="size-5" strokeWidth={2.5} />
      </span>
      Turn-Based
    </Link>
  )
}

function Showcase() {
  return (
    <div className="relative isolate h-full overflow-hidden rounded-[2.5rem] bg-night-900 ring-1 ring-white/6">
      <GameWall />

      {/* Darken the wall so the copy reads, strongest where the copy sits */}
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-950 via-night-950/70 to-night-950/20" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-night-950/80 to-transparent" />
      <div aria-hidden className="absolute -bottom-40 -left-20 size-[30rem] rounded-full bg-brand-600/35 blur-[120px]" />

      <div className="relative flex h-full flex-col justify-between p-10 xl:p-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.3 }}
          className="self-start"
        >
          <Badge tone="brand" live>
            1,204 games in play
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.15 }}
        >
          <h2 className="text-5xl leading-[1.02] font-extrabold xl:text-6xl">
            Your move.
            <br />
            <span className="text-brand-500">Whenever.</span>
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {FEATURES.map(([Icon, label]) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3.5 py-2 text-sm font-semibold text-night-100 ring-1 ring-white/10 backdrop-blur-md"
              >
                <Icon className="size-4 text-brand-400" strokeWidth={2.5} aria-hidden />
                {label}
              </span>
            ))}
          </div>

          <figure className="mt-8 rounded-3xl bg-night-950/60 p-6 ring-1 ring-white/8 backdrop-blur-xl">
            <Quote className="size-7 fill-brand-500 text-brand-500" aria-hidden />
            <blockquote className="mt-3 text-lg leading-snug font-semibold text-night-50">
              Played my move from an airport, got the win three days later. My brother still wants a rematch.
            </blockquote>
            <figcaption className="mt-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar name="Joan Clarke" seat="lime" size="md" />
                <div className="text-sm leading-tight">
                  <div className="font-bold">Joan Clarke</div>
                  <div className="text-night-400">14 game win streak</div>
                </div>
              </div>
              <div className="hidden items-center gap-2 xl:flex">
                <div className="flex -space-x-2.5">
                  {PLAYERS.map(([name, seat]) => (
                    <Avatar key={name} name={name} seat={seat} size="sm" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-night-300">8,400+</span>
              </div>
            </figcaption>
          </figure>
        </motion.div>
      </div>
    </div>
  )
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col px-4 py-6 sm:px-10">
          <div className="self-start">
            <Logo />
          </div>

          <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
            <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
            <p className="mt-2 mb-8 text-night-300">{subtitle}</p>
            {children}
            <div className="mt-8 text-center text-sm text-night-400">{footer}</div>
          </main>
        </div>

        <div className="hidden p-4 lg:block">
          <div className="sticky top-4 h-[calc(100vh-2rem)]">
            <Showcase />
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}
