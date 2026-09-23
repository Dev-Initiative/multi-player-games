import type { Transition, Variants } from 'motion/react'

/** Soft, slightly springy ease used for every entrance on the homepage. */
export const EASE_OUT: Transition['ease'] = [0.22, 1, 0.36, 1]

/** Parent: reveals its children one after another. */
export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
})

/** Child: rises and fades in. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

/** Child: pops in from small, for badges and pieces. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 20 } },
}

/** Scroll-triggered sections animate once, a little before they are fully on screen. */
export const inView = { once: true, margin: '-80px' } as const
