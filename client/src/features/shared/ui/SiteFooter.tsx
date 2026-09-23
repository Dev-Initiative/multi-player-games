import { Gamepad2 } from 'lucide-react'
import { Link } from 'react-router'

const LINKS: [string, string][] = [
  ['Log in', '/login'],
  ['Create account', '/register'],
  ['Styles guide', '/styles-guide'],
]

export function SiteFooter() {
  return (
    <footer className="border-t border-white/6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-8">
        <div className="flex items-center gap-2.5 font-display font-extrabold">
          <span className="grid size-8 place-items-center rounded-lg bg-brand-500 text-white">
            <Gamepad2 className="size-4" strokeWidth={2.5} />
          </span>
          Turn-Based
        </div>
        <nav className="flex gap-6 text-sm font-semibold text-night-400">
          {LINKS.map(([label, to]) => (
            <Link key={to} to={to} className="transition-colors hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <div className="text-sm text-night-500">Made for long games.</div>
      </div>
    </footer>
  )
}
