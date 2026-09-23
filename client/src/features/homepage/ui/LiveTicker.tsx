import { Crown, Grip, Ship, Swords, Trophy, Zap, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import type { Seat } from '../../shared/ui/seat'
import { seatVars } from '../../shared/ui/seat'

const EVENTS: [LucideIcon, Seat, string][] = [
  [Trophy, 'sun', 'Ada won Connect 4 in 11 moves'],
  [Grip, 'lime', 'Grace closed 3 boxes in one turn'],
  [Ship, 'sky', 'Linus sank a battleship'],
  [Crown, 'sun', 'Barbara is on a 9 game streak'],
  [Swords, 'tangerine', 'Alan challenged Ada to a rematch'],
  [Zap, 'sky', 'Joan played her move 4 days later. Still counts.'],
]

function Item({ icon: Icon, seat, text }: { icon: LucideIcon; seat: Seat; text: string }) {
  return (
    <div style={seatVars(seat)} className="flex shrink-0 items-center gap-3 pr-10">
      <span className="grid size-8 place-items-center rounded-lg bg-(--seat)/15 text-(--seat)">
        <Icon className="size-4" strokeWidth={2.5} aria-hidden />
      </span>
      <span className="font-semibold whitespace-nowrap text-night-200">{text}</span>
      <span className="ml-6 size-1.5 rounded-full bg-night-600" />
    </div>
  )
}

/** Endless strip of recent activity. The list is doubled so the loop is seamless. */
export function LiveTicker() {
  return (
    <div
      aria-label="Recent activity"
      className="relative overflow-hidden border-y border-white/6 bg-night-900/60 py-4 mask-[linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
    >
      <motion.div
        className="flex w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {[...EVENTS, ...EVENTS].map(([icon, seat, text], i) => (
          <Item key={i} icon={icon} seat={seat} text={text} />
        ))}
      </motion.div>
    </div>
  )
}
