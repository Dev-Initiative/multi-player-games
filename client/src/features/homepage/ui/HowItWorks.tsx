import { Coins, Hourglass, Plus, Trophy, UserPlus } from 'lucide-react'
import { motion } from 'motion/react'
import { Avatar } from '../../shared/ui/Avatar'
import { Badge } from '../../shared/ui/Badge'
import { Currency } from '../../shared/ui/Currency'
import { Meter } from '../../shared/ui/Meter'
import { inView, stagger } from '../../shared/ui/motion'
import { SectionHeading } from './SectionHeading'
import { StepCard } from './StepCard'

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-24 border-y border-white/6 bg-night-900/40 py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading kicker="How it works" title="Three steps to a rematch." align="center">
          No lobbies to wait in, no clocks ticking. Just you, your friends, and the next move.
        </SectionHeading>

        <motion.div
          variants={stagger(0.15)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="mt-16 grid gap-5 md:grid-cols-3"
        >
          <StepCard
            step={1}
            icon={UserPlus}
            title="Invite your crew"
            art={
              <div className="flex items-center">
                <Avatar name="You" seat="sky" size="lg" />
                <div className="-ml-3 flex -space-x-3">
                  <Avatar name="Grace Hopper" seat="sun" size="lg" />
                  <Avatar name="Linus T" seat="lime" size="lg" />
                </div>
                <span className="-ml-3 grid size-16 place-items-center rounded-full border-2 border-dashed border-night-500 bg-night-900 text-night-400">
                  <Plus className="size-6" strokeWidth={2.5} />
                </span>
              </div>
            }
          >
            Open a lobby, add friends by username. It starts when the last seat accepts.
          </StepCard>

          <StepCard
            step={2}
            icon={Hourglass}
            title="Take your time"
            art={
              <div className="w-full space-y-3">
                <div className="flex justify-between">
                  <Badge tone="brand" live>
                    Your turn
                  </Badge>
                  <span className="text-sm text-night-400">Grace moved 2h ago</span>
                </div>
                <Meter value={0.72} seat="lime" label="Turn timer" detail="3 days left" />
              </div>
            }
          >
            Move when you're ready. Close the app for days, and the game is exactly where you left it.
          </StepCard>

          <StepCard
            step={3}
            icon={Trophy}
            title="Claim the win"
            art={
              <div className="flex flex-wrap items-center gap-3">
                <motion.span
                  animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4 }}
                  className="grid size-14 place-items-center rounded-2xl bg-linear-to-b from-gold to-gold-deep text-night-950 shadow-[0_4px_0_color-mix(in_oklab,var(--color-gold-deep)_70%,black),inset_0_2px_0_rgb(255_255_255/0.5)]"
                >
                  <Trophy className="size-7" strokeWidth={2.5} />
                </motion.span>
                <Currency icon={Coins} value={250} />
              </div>
            }
          >
            Win, climb the leaderboard, and hit rematch before they can say "best of three."
          </StepCard>
        </motion.div>
      </div>
    </section>
  )
}
