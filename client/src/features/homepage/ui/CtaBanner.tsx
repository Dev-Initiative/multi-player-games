import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { Disc } from '../../shared/ui/Disc'
import type { Seat } from '../../shared/ui/seat'
import { EASE_OUT, inView } from '../../shared/ui/motion'

const PIECES: { seat: Seat; className: string; delay: number }[] = [
  { seat: 'sun', className: 'top-8 left-[8%] size-14', delay: 0 },
  { seat: 'sky', className: 'bottom-10 left-[18%] size-9', delay: 0.8 },
  { seat: 'lime', className: 'top-10 right-[12%] size-10', delay: 0.4 },
  { seat: 'tangerine', className: 'right-[6%] bottom-8 size-16', delay: 1.2 },
]

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={inView}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className="relative isolate overflow-hidden rounded-[2.5rem] bg-linear-to-br from-brand-500 via-brand-600 to-brand-800 px-6 py-20 text-center shadow-[0_12px_0_0_var(--color-brand-900),inset_0_2px_0_rgb(255_255_255/0.25)]"
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(rgb(0_0_0/0.18)_1.5px,transparent_1.5px)] bg-size-[24px_24px]"
        />
        {PIECES.map(({ seat, className, delay }) => (
          <motion.span
            key={seat}
            aria-hidden
            className={`absolute -z-10 hidden sm:block ${className}`}
            animate={{ y: [0, -14, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
          >
            <Disc seat={seat} className="size-full" />
          </motion.span>
        ))}

        <h2 className="mx-auto max-w-2xl text-5xl leading-[1.02] font-extrabold text-white sm:text-6xl">
          Somebody's waiting on your move.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg text-brand-100/85">
          Free to play. Make an account, invite a friend, and drop your first disc.
        </p>
        <motion.div className="mt-10 inline-block" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link
            to="/register"
            className="press group inline-flex h-15 items-center gap-2.5 rounded-[1.25rem] bg-white px-8 font-display text-xl font-bold text-night-950 [--press-depth:6px] [--press-edge:rgb(0_0_0/0.3)]"
          >
            Create your account
            <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" strokeWidth={2.75} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
