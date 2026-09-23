import { ArrowLeft, Circle, Flag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '../../shared/ui/Badge'
import { Button } from '../../shared/ui/Button'
import { Dialog } from '../../shared/ui/Dialog'
import { isFinished, type GameRecord, type GameStatus } from '../../games/store'

type GameHeaderProps = {
  game: GameRecord
  status: GameStatus
  onResign: () => void
}

const BADGE: Record<GameStatus, { label: string; tone: 'brand' | 'neutral' | 'lime' | 'tangerine' | 'sun'; live?: boolean }> = {
  'your-turn': { label: 'Your turn', tone: 'brand', live: true },
  'their-turn': { label: 'Their turn', tone: 'neutral' },
  won: { label: 'You won', tone: 'lime' },
  lost: { label: 'You lost', tone: 'tangerine' },
  draw: { label: 'Draw', tone: 'sun' },
}

/** Back link, game title and id, and the resign action. */
export function GameHeader({ game, status, onResign }: GameHeaderProps) {
  const [confirming, setConfirming] = useState(false)
  const badge = BADGE[status]
  const opponent = game.seats.find((s) => !s.isYou)

  return (
    <div className="mb-8 flex flex-wrap items-center gap-4">
      <Link
        to="/my-games"
        className="grid size-11 place-items-center rounded-xl bg-night-800 text-night-200 ring-1 ring-white/8 transition-colors hover:bg-night-700 hover:text-white"
        aria-label="Back to my games"
      >
        <ArrowLeft className="size-5" strokeWidth={2.5} />
      </Link>
      <span className="grid size-11 place-items-center rounded-xl bg-linear-to-br from-tangerine to-tangerine-deep text-white shadow-[inset_0_2px_0_rgb(255_255_255/0.3)]">
        <Circle className="size-5" strokeWidth={2.75} />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <h1 className="truncate text-2xl font-extrabold">Connect 4 vs {opponent?.name}</h1>
        <div className="font-mono text-xs text-night-500">game/{game.id} · seq {game.moves.length}</div>
      </div>
      <Badge tone={badge.tone} live={badge.live}>
        {badge.label}
      </Badge>
      {!isFinished(status) && (
        <Button variant="ghost" size="sm" icon={Flag} onClick={() => setConfirming(true)}>
          Resign
        </Button>
      )}

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Resign this game?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Keep playing
            </Button>
            <Button
              icon={Flag}
              onClick={() => {
                setConfirming(false)
                onResign()
              }}
            >
              Resign
            </Button>
          </>
        }
      >
        {opponent?.name} gets the win. It can't be undone, but you can ask for a rematch.
      </Dialog>
    </div>
  )
}
