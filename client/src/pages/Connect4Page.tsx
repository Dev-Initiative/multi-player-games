import { useNavigate, useParams } from 'react-router'
import { ConfigChips } from '../features/connect4/ui/ConfigChips'
import { Connect4Board } from '../features/connect4/ui/Connect4Board'
import { useConnect4Game } from '../features/connect4/useConnect4Game'
import { gamePath, rematch } from '../features/games/store'
import { GameNotFound } from '../features/games/ui/GameNotFound'
import { GameScreen } from '../features/games/ui/GameScreen'
import { Disc } from '../features/shared/ui/Disc'
import { Kbd } from '../features/shared/ui/Kbd'

export function Connect4Page() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const session = useConnect4Game(gameId)
  const { game, position, status, you, play } = session

  if (!game || !position || !status) return <GameNotFound />

  const { cols, rows, connect } = position.config
  const colors = game.seats.map((s) => s.color)
  const rules = [
    'Take turns dropping a disc into any column.',
    'It falls to the lowest open slot in that column.',
    `Line up ${connect} of your discs in a row, across, down or diagonally, to win.`,
    `The board is ${cols} wide and ${rows} tall. If it fills up with no winner, it's a draw.`,
  ]

  return (
    <GameScreen
      {...session}
      game={game}
      status={status}
      piece={(seat, className = 'size-4') => <Disc seat={colors[seat]} className={className} />}
      rules={rules}
      variantLabel={`${cols}×${rows} · connect ${connect}`}
      setupSummary={<ConfigChips config={position.config} />}
      hint={
        <>
          Click a column, or press <Kbd>1</Kbd>–<Kbd>{String(cols)}</Kbd>
        </>
      }
      winDetail={`${connect} in a row.`}
      lossDetail="Rematch?"
      describeMove={(m) => `Dropped in column ${m.move + 1}`}
      newGamePath="/games/connect-4/new"
      onResign={session.resign}
      onCancel={session.cancel}
      onRematch={() => navigate(gamePath({ type: game.type, id: rematch(game.id) }))}
      board={
        <Connect4Board
          position={position}
          colors={colors}
          playerSeat={status === 'your-turn' ? you : null}
          onDrop={play}
        />
      }
    />
  )
}
