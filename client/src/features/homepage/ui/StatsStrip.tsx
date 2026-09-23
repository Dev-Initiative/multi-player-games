import { motion } from 'motion/react'
import { inView, popIn, stagger } from '../../shared/ui/motion'

const STATS = [
  ['8,400+', 'players'],
  ['1.2M', 'moves played'],
  ['∞', 'rematches'],
  ['0', 'moves lost. Ever.'],
]

export function StatsStrip() {
  return (
    <motion.div
      variants={stagger(0.1)}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/6 ring-1 ring-white/6 lg:grid-cols-4"
    >
      {STATS.map(([value, label]) => (
        <motion.div key={label} variants={popIn} className="bg-night-950 px-6 py-8 text-center">
          <div className="font-display text-5xl font-extrabold tracking-tight text-white">{value}</div>
          <div className="mt-1 text-sm font-semibold text-night-400">{label}</div>
        </motion.div>
      ))}
    </motion.div>
  )
}
