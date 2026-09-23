import { Circle, Crown, Grip, Hash, Ship } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '../../../lib/cn'
import { Avatar } from '../../shared/ui/Avatar'
import { Panel } from '../../shared/ui/Panel'
import type { Seat } from '../../shared/ui/seat'
import { MatchCard } from './MatchCard'
import { inView, rise, stagger } from '../../shared/ui/motion'
import { SectionHeading } from './SectionHeading'

const LEADERS: { name: string; seat: Seat; wins: number; streak: number }[] = [
  { name: 'Barbara L', seat: 'tangerine', wins: 312, streak: 9 },
  { name: 'Ada Lovelace', seat: 'sky', wins: 287, streak: 4 },
  { name: 'Grace Hopper', seat: 'sun', wins: 251, streak: 2 },
  { name: 'Linus T', seat: 'lime', wins: 198, streak: 0 },
  { name: 'Alan Turing', seat: 'sky', wins: 176, streak: 3 },
]

const MEDAL = ['bg-gold text-night-950', 'bg-night-200 text-night-950', 'bg-tangerine-deep text-white']

export function LeaderboardSection() {
  return (
    <section id="leaderboard" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-28 sm:px-8">
      <SectionHeading kicker="Always something on" title="Your games, one glance.">
        See whose move it is across every game, and how you stack up against everyone else.
      </SectionHeading>

      <div className="mt-14 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Panel className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between px-1">
            <h3 className="text-xl font-extrabold">Your games</h3>
            <span className="text-sm text-night-400">4 active</span>
          </div>
          <motion.div
            variants={stagger(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={inView}
            className="space-y-2.5"
          >
            <MatchCard
              game="Connect 4"
              icon={Circle}
              seat="tangerine"
              status="your-turn"
              lastMove="Grace dropped in column 4 · 2h ago"
              players={[{ name: 'Grace Hopper', seat: 'sun' }]}
            />
            <MatchCard
              game="Dots and Boxes"
              icon={Grip}
              seat="lime"
              status="waiting"
              lastMove="You closed 2 boxes · yesterday"
              players={[
                { name: 'Linus T', seat: 'lime' },
                { name: 'Ada Lovelace', seat: 'sky' },
                { name: 'Barbara L', seat: 'tangerine' },
              ]}
            />
            <MatchCard
              game="Battleship"
              icon={Ship}
              seat="sky"
              status="lobby"
              lastMove="Waiting for Alan to accept"
              players={[{ name: 'Alan Turing', seat: 'sky' }]}
            />
            <MatchCard
              game="Tic-tac-toe"
              icon={Hash}
              seat="sun"
              status="won"
              lastMove="Diagonal win · 3 days ago"
              players={[{ name: 'Joan C', seat: 'sun' }]}
            />
          </motion.div>
        </Panel>

        <Panel className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between px-1">
            <h3 className="text-xl font-extrabold">Top players</h3>
            <span className="text-sm text-night-400">This week</span>
          </div>
          <motion.ol
            variants={stagger(0.08, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={inView}
            className="space-y-2"
          >
            {LEADERS.map((p, i) => (
              <motion.li
                key={p.name}
                variants={rise}
                className={cn(
                  'flex items-center gap-3 rounded-2xl p-2.5 pr-4',
                  i === 0 ? 'bg-gold/8 ring-1 ring-gold/30' : 'bg-white/3',
                )}
              >
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-lg font-display text-sm font-extrabold',
                    MEDAL[i] ?? 'text-night-400',
                  )}
                >
                  {i + 1}
                </span>
                <Avatar name={p.name} seat={p.seat} size="md" active={i === 0} />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-center gap-1.5 truncate font-bold">
                    {p.name}
                    {i === 0 && <Crown className="size-4 text-gold" strokeWidth={2.5} aria-label="Leader" />}
                  </div>
                  <div className="text-sm text-night-400">
                    {p.streak > 0 ? `${p.streak} win streak` : 'No streak'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl font-extrabold tabular-nums">{p.wins}</div>
                  <div className="text-xs text-night-500">wins</div>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </Panel>
      </div>
    </section>
  )
}
