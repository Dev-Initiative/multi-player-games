import { SearchX } from 'lucide-react'
import { MotionConfig } from 'motion/react'
import { Link, useNavigate, useParams } from 'react-router'
import { Connect4Board } from '../features/connect4/ui/Connect4Board'
import { GameHeader } from '../features/connect4/ui/GameHeader'
import { GameOverCard } from '../features/connect4/ui/GameOverCard'
import { MoveHistory } from '../features/connect4/ui/MoveHistory'
import { PlayersPanel } from '../features/connect4/ui/PlayersPanel'
import { TurnBanner } from '../features/connect4/ui/TurnBanner'
import { useConnect4Game } from '../features/connect4/useConnect4Game'
import { isFinished, rematch } from '../features/games/store'
import { buttonStyles } from '../features/shared/ui/buttonStyles'
import { EmptyState } from '../features/shared/ui/EmptyState'
import { SiteNav } from '../features/shared/ui/SiteNav'

export function Connect4Page() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { game, position, status, you, opponent, play, resign } = useConnect4Game(gameId)

  if (!game || !position || !status) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <main className="mx-auto max-w-xl px-4 py-24">
          <EmptyState
            icon={SearchX}
            title="Game not found"
            action={
              <Link to="/my-games" className={buttonStyles()}>
                Back to my games
              </Link>
            }
          >
            It may have been started on another device. Games live on this browser until the server is connected.
          </EmptyState>
        </main>
      </div>
    )
  }

  const colors = game.seats.map((s) => s.color)
  const finished = isFinished(status)

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <SiteNav />
        <main className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-8">
          <GameHeader game={game} status={status} onResign={resign} />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="mx-auto w-full max-w-[36rem]">
              <TurnBanner
                status={status}
                you={game.seats[you]}
                opponent={game.seats[opponent]}
                resigned={game.resignedBy !== null}
              />
              <div className="relative mt-6">
                <Connect4Board
                  position={position}
                  colors={colors}
                  playerSeat={status === 'your-turn' ? you : null}
                  onDrop={play}
                />
                {finished && (
                  <GameOverCard
                    status={status}
                    opponentName={game.seats[opponent].name}
                    onRematch={() => navigate(`/games/connect-4/${rematch(game.id)}`)}
                  />
                )}
              </div>
            </div>

            <aside className="space-y-4">
              <PlayersPanel
                game={game}
                currentSeat={finished ? null : position.currentSeat}
                winner={game.resignedBy !== null ? 1 - game.resignedBy : position.winner}
              />
              <MoveHistory game={game} />
            </aside>
          </div>
        </main>
      </div>
    </MotionConfig>
  )
}
