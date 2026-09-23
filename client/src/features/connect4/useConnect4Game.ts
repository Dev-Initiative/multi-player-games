import { connect4Config, type GameRecord } from '../games/store'
import { useGameSession } from '../games/useGameSession'
import { chooseColumn } from './bot'
import { replay } from './rules'

const positionOf = (game: GameRecord) =>
  replay(
    game.moves.map((m) => m.move),
    game.firstSeat,
    connect4Config(game),
  )

/** A Connect 4 game in play, with its board position. */
export function useConnect4Game(id: string | undefined) {
  const session = useGameSession(id, 'connect-4', (game, seat) =>
    chooseColumn(positionOf(game).board, seat, connect4Config(game)),
  )
  const position = session.game ? positionOf(session.game) : null
  return { ...session, position }
}
