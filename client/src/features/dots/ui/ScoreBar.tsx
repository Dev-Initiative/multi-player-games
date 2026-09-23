import { motion } from 'motion/react'
import type { SeatInfo } from '../../games/store'
import { BOX_COUNT } from '../rules'

/** Tug-of-war bar: each seat's share of the claimed boxes, with the unclaimed rest in the middle. */
export function ScoreBar({ seats, scores }: { seats: SeatInfo[]; scores: number[] }) {
  const left = BOX_COUNT - scores.reduce((a, b) => a + b, 0)
  return (
    <div className="mt-5">
      <div className="flex h-3 overflow-hidden rounded-full bg-night-800 shadow-[inset_0_2px_4px_rgb(0_0_0/0.5)]">
        {seats.map((seat, i) => (
          <motion.div
            key={i}
            className="h-full first:rounded-l-full"
            style={{ background: `var(--color-${seat.color})`, order: i === 0 ? 0 : 2 }}
            animate={{ width: `${(scores[i] / BOX_COUNT) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          />
        ))}
        <div className="flex-1" style={{ order: 1 }} />
      </div>
      <div className="mt-2 flex justify-between text-xs font-semibold text-night-400">
        <span>
          {seats[0].isYou ? 'You' : seats[0].name.split(' ')[0]} {scores[0]}
        </span>
        <span>{left} boxes left</span>
        <span>
          {scores[1]} {seats[1].isYou ? 'You' : seats[1].name.split(' ')[0]}
        </span>
      </div>
    </div>
  )
}
