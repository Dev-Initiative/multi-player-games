import { ArrowLeft, BookOpen, Flag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '../../shared/ui/Badge'
import { Button } from '../../shared/ui/Button'
import { Dialog } from '../../shared/ui/Dialog'
import { seatVars } from '../../shared/ui/seat'
import { GAMES } from '../catalog'
import { STATUS_BADGE } from '../statusBadge'
import { isInPlay, type GameRecord, type GameStatus } from '../store'
import { RulesDialog } from './RulesDialog'

type GameTopBarProps = {
  game: GameRecord
  status: GameStatus
  rules: string[]
  variantLabel?: string
  onResign: () => void
}

/** The game's own slim bar: way back, what this is, rules, resign. */
export function GameTopBar({ game, status, rules, variantLabel, onResign }: GameTopBarProps) {
  const [dialog, setDialog] = useState<'rules' | 'resign' | null>(null)
  const meta = GAMES.find((g) => g.id === game.type)
  const Icon = meta?.icon
  const badge = STATUS_BADGE[status]
  const opponent = game.seats
    .filter((s) => !s.isYou)
    .map((s) => s.name)
    .join(', ')

  return (
    <header className="sticky top-0 z-30 border-b border-white/6 bg-night-950/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-8">
        <Link
          to="/my-games"
          aria-label="Back to my games"
          className="grid size-10 shrink-0 place-items-center rounded-xl text-night-300 transition-colors hover:bg-white/6 hover:text-white"
        >
          <ArrowLeft className="size-5" strokeWidth={2.5} />
        </Link>

        {Icon && meta && (
          <span
            style={seatVars(meta.seat)}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-(--seat) to-(--seat-deep) text-white shadow-[0_3px_0_color-mix(in_oklab,var(--seat-deep)_70%,black),inset_0_2px_0_rgb(255_255_255/0.3)]"
          >
            <Icon className="size-5" strokeWidth={2.75} />
          </span>
        )}
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate font-display text-lg font-extrabold">{meta?.title}</div>
          <div className="truncate text-xs text-night-400">
            vs {opponent}
            {variantLabel && <span className="text-night-500"> · {variantLabel}</span>}
            <span className="font-mono text-night-600"> · #{game.id}</span>
          </div>
        </div>

        <span className="hidden sm:block">
          <Badge tone={badge.tone} live={badge.live}>
            {badge.label}
          </Badge>
        </span>
        <Button variant="ghost" size="sm" icon={BookOpen} onClick={() => setDialog('rules')}>
          <span className="hidden sm:inline">Rules</span>
        </Button>
        {isInPlay(status) && (
          <Button variant="ghost" size="sm" icon={Flag} onClick={() => setDialog('resign')}>
            <span className="hidden sm:inline">Resign</span>
          </Button>
        )}
      </div>

      <RulesDialog open={dialog === 'rules'} onClose={() => setDialog(null)} title={meta?.title ?? ''} rules={rules} />
      <Dialog
        open={dialog === 'resign'}
        onClose={() => setDialog(null)}
        title="Resign this game?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Keep playing
            </Button>
            <Button
              icon={Flag}
              onClick={() => {
                setDialog(null)
                onResign()
              }}
            >
              Resign
            </Button>
          </>
        }
      >
        {opponent} gets the win. It can't be undone, but you can ask for a rematch.
      </Dialog>
    </header>
  )
}
