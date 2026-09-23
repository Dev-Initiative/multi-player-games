import { AnimatePresence, motion } from 'motion/react'
import type { Seat } from '../../shared/ui/seat'

/** A soft glow behind the board in the color of whoever is to move. Crossfades on turn change. */
export function Spotlight({ color }: { color: Seat | 'gold' | null }) {
  return (
    <div aria-hidden className="pointer-events-none absolute -inset-x-24 -top-16 -bottom-24 -z-10">
      <AnimatePresence>
        {color && (
          <motion.div
            key={color}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              background: `radial-gradient(closest-side, color-mix(in oklab, var(--color-${color}) 22%, transparent), transparent)`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
