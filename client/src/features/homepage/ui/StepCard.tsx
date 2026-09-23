import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { rise } from '../../shared/ui/motion'

type StepCardProps = {
  step: number
  icon: LucideIcon
  title: string
  children: ReactNode
  /** Small illustration at the bottom of the card. */
  art: ReactNode
}

export function StepCard({ step, icon: Icon, title, children, art }: StepCardProps) {
  return (
    <motion.div
      variants={rise}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="panel relative flex flex-col overflow-hidden rounded-3xl p-7"
    >
      <span
        aria-hidden
        className="absolute -top-6 -right-2 font-display text-[9rem] leading-none font-extrabold text-white/4"
      >
        {step}
      </span>
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-500 text-white shadow-[0_4px_0_var(--color-brand-800),inset_0_2px_0_rgb(255_255_255/0.3)]">
        <Icon className="size-6" strokeWidth={2.5} aria-hidden />
      </span>
      <div className="mt-6 text-xs font-bold tracking-widest text-night-400 uppercase">Step {step}</div>
      <h3 className="mt-1 text-2xl font-extrabold">{title}</h3>
      <p className="mt-2 text-night-300">{children}</p>
      <div className="mt-8 flex flex-1 items-end">{art}</div>
    </motion.div>
  )
}
