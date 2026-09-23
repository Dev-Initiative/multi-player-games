import { Gamepad2 } from 'lucide-react'
import { motion } from 'motion/react'
import { Link, NavLink } from 'react-router'
import { cn } from '../../../lib/cn'
import { buttonStyles } from './buttonStyles'
import { EASE_OUT } from './motion'

const LINKS = [
  ['Games', '/games'],
  ['My games', '/my-games'],
  ['How it works', '/#how'],
  ['Leaderboard', '/#leaderboard'],
]

export function SiteNav() {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="sticky top-0 z-30 border-b border-white/6 bg-night-950/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-8 px-4 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-2.5 font-display text-lg font-extrabold">
          <motion.span
            whileHover={{ rotate: -12, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            className="grid size-10 place-items-center rounded-xl bg-brand-500 text-white shadow-[0_3px_0_var(--color-brand-800),inset_0_1px_0_rgb(255_255_255/0.3)]"
          >
            <Gamepad2 className="size-5" strokeWidth={2.5} />
          </motion.span>
          Turn-Based
        </Link>

        <nav className="hidden flex-1 gap-1 md:flex">
          {LINKS.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/6 hover:text-white',
                  isActive && !to.includes('#') ? 'bg-white/6 text-white' : 'text-night-300',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/login" className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
            Log in
          </Link>
          <Link to="/register" className={buttonStyles({ size: 'sm' })}>
            Play free
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
