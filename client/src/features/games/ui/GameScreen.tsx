import { AnimatePresence, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { isFinished, isInPlay, type GameRecord, type GameStatus, type MoveEntry } from '../store'
import { CancelledCard } from './CancelledCard'
import { GameOverCard } from './GameOverCard'
import { LobbyCard } from './LobbyCard'
import { GameTopBar } from './GameTopBar'
import { MoveTimeline } from './MoveTimeline'
import { Spotlight } from './Spotlight'
import { TurnCallout } from './TurnCallout'
import { VersusBar } from './VersusBar'

export type GameScreenProps = {
  game: GameRecord
  status: GameStatus
  you: number
  opponent: number
  currentSeat: number | null
  winner: number | null
  /** The board itself. */
  board: ReactNode
  /** A seat's piece at a given size. */
  piece: (seat: number, className?: string) => ReactNode
  score?: (seat: number) => number
  rules: string[]
  /** How to move, shown under the board. */
  hint: ReactNode
  turnTitle?: string
  winDetail: string
  lossDetail: string
  /** Extra line on the game-over card, e.g. the final score. */
  resultDetail?: ReactNode
  describeMove: (move: MoveEntry, index: number) => ReactNode
  /** The game's settings as chips, shown in the lobby and the top bar. */
  setupSummary?: ReactNode
  /** Short settings label for the top bar, e.g. "8×7 · connect 5". */
  variantLabel?: string
  /** Where "New game" goes after a cancelled invite. */
  newGamePath: string
  onResign: () => void
  onRematch: () => void
  onCancel: () => void
}

/**
 * The shared arena every game plays in: top bar, versus scoreboard, the
 * board under a spotlight in the mover's color, and the move timeline.
 * A game page supplies its board, pieces and wording.
 */
export function GameScreen(props: GameScreenProps) {
  const { game, status, you, opponent, currentSeat, winner, board, piece, rules, hint } = props
  const finished = isFinished(status)
  const spotlight = status === 'won' ? 'gold' : currentSeat !== null ? game.seats[currentSeat].color : null

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <GameTopBar
          game={game}
          status={status}
          rules={rules}
          variantLabel={props.variantLabel}
          onResign={props.onResign}
        />

        <main className="mx-auto grid max-w-7xl gap-8 px-4 pt-6 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <section className="mx-auto w-full max-w-[38rem]">
            <VersusBar
              game={game}
              status={status}
              you={you}
              opponent={opponent}
              currentSeat={currentSeat}
              winner={winner}
              piece={piece}
              score={props.score}
            />

            <div className="relative isolate mt-6">
              <Spotlight color={spotlight} />
              <TurnCallout
                status={status}
                you={game.seats[you]}
                opponent={game.seats[opponent]}
                resigned={game.resignedBy !== null}
                piece={piece(you, 'size-6')}
                turnTitle={props.turnTitle}
                winDetail={props.winDetail}
                lossDetail={props.lossDetail}
              />
              <div className="relative mt-5">
                {board}
                <AnimatePresence>
                  {status === 'lobby' && (
                    <LobbyCard
                      key="lobby"
                      invitee={game.seats[opponent]}
                      summary={props.setupSummary}
                      onCancel={props.onCancel}
                    />
                  )}
                </AnimatePresence>
                {status === 'cancelled' && (
                  <CancelledCard
                    declinedBy={game.seats.find((s) => s.invite === 'declined')?.name}
                    newGamePath={props.newGamePath}
                  />
                )}
                {finished && (
                  <GameOverCard
                    status={status}
                    opponentName={game.seats[opponent].name}
                    detail={props.resultDetail}
                    onRematch={props.onRematch}
                  />
                )}
              </div>
              {isInPlay(status) && <div className="mt-8 text-center text-sm text-night-400">{hint}</div>}
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <MoveTimeline game={game} piece={piece} describe={props.describeMove} />
          </aside>
        </main>
      </div>
    </MotionConfig>
  )
}
