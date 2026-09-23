import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../../../lib/cn'
import { inView, rise, stagger } from '../../shared/ui/motion'

type SectionHeadingProps = {
  kicker: string
  title: ReactNode
  children?: ReactNode
  align?: 'left' | 'center'
}

export function SectionHeading({ kicker, title, children, align = 'left' }: SectionHeadingProps) {
  return (
    <motion.div
      variants={stagger(0.1)}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}
    >
      <motion.div
        variants={rise}
        className={cn(
          'inline-flex items-center gap-2 text-sm font-bold tracking-widest text-brand-400 uppercase',
          align === 'center' && 'justify-center',
        )}
      >
        <span className="h-0.5 w-6 rounded-full bg-brand-500" />
        {kicker}
      </motion.div>
      <motion.h2 variants={rise} className="mt-3 text-4xl leading-[1.05] font-extrabold sm:text-5xl">
        {title}
      </motion.h2>
      {children && (
        <motion.p variants={rise} className="mt-4 text-lg text-night-300">
          {children}
        </motion.p>
      )}
    </motion.div>
  )
}
