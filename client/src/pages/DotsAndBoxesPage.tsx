import { useNavigate, useParams } from 'react-router'
import { edgeName } from '../features/dots/rules'
import { BoxSwatch } from '../features/dots/ui/BoxSwatch'
import { DotsBoard } from '../features/dots/ui/DotsBoard'
import { ScoreBar } from '../features/dots/ui/ScoreBar'
import { useDotsGame } from '../features/dots/useDotsGame'
import { gamePath, rematch } from '../features/games/store'
import { GameNotFound } from '../features/games/ui/GameNotFound'
import { GameScreen } from '../features/games/ui/GameScreen'

const RULES = [
  'Take turns drawing a line between two neighbouring dots.',
  'Draw the fourth side of a box to claim it, then take another turn.',
  'One line can close two boxes at once.',
  'When every line is drawn, whoever claimed the most boxes wins.',
]

export function DotsAndBoxesPage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const session = useDotsGame(gameId)
  const { game, position, status, you, opponent, play } = session

  if (!game || !position || !status) return <GameNotFound />

  const colors = game.seats.map((s) => s.color)
  // You drew the last line and closed a box, so it's your move again.
  const goAgain = status === 'your-turn' && position.lastBoxes.length > 0 && game.moves.at(-1)?.seat === you
  const [mine, theirs] = [position.scores[you], position.scores[opponent]]

  return (
    <GameScreen
      {...session}
      game={game}
      status={status}
      piece={(seat, className = 'size-4') => <BoxSwatch color={colors[seat]} className={className} />}
      score={(seat) => position.scores[seat]}
      rules={RULES}
      turnTitle={goAgain ? 'Box! Go again' : 'Your move'}
      hint={goAgain ? 'You closed a box, so draw another line.' : 'Draw a line between two dots. Close a box to go again.'}
      winDetail={`${mine}–${theirs}.`}
      lossDetail={`${theirs}–${mine}.`}
      resultDetail={
        <span className="font-display text-2xl font-extrabold tabular-nums">
          {mine} <span className="text-night-500">–</span> {theirs}
        </span>
      }
      describeMove={(m, i) => {
        const claimed = position.claims[i]
        return (
          <>
            Drew {edgeName(m.move)}
            {claimed > 0 && (
              <span className="ml-1.5 font-semibold text-lime">
                +{claimed} box{claimed === 1 ? '' : 'es'}
              </span>
            )}
          </>
        )
      }}
      newGamePath="/games"
      onResign={session.resign}
      onCancel={session.cancel}
      onRematch={() => navigate(gamePath({ type: game.type, id: rematch(game.id) }))}
      board={
        <>
          <DotsBoard
            position={position}
            colors={colors}
            names={game.seats.map((s) => (s.isYou ? 'Me' : s.name))}
            playerSeat={status === 'your-turn' ? you : null}
            onDraw={play}
          />
          <ScoreBar seats={game.seats} scores={position.scores} />
        </>
      }
    />
  )
}
