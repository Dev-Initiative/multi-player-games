import { Grid3x3, Link2 } from 'lucide-react'
import type { Connect4Config } from '../rules'

const chip =
  'inline-flex items-center gap-1.5 rounded-full bg-white/6 px-2.5 py-1 text-xs font-bold text-night-200 ring-1 ring-white/8'

/** A Connect 4 game's settings at a glance. */
export function ConfigChips({ config }: { config: Connect4Config }) {
  return (
    <>
      <span className={chip}>
        <Grid3x3 className="size-3.5" strokeWidth={2.5} aria-hidden />
        {config.cols}×{config.rows} board
      </span>
      <span className={chip}>
        <Link2 className="size-3.5" strokeWidth={2.5} aria-hidden />
        {config.connect} in a row wins
      </span>
    </>
  )
}
