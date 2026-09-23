import { useGameSession } from '../games/useGameSession'
import type { GameRecord } from '../games/store'
import { chooseEdge } from './bot'
import { replay } from './rules'

const positionOf = (game: GameRecord) =>
  replay(
    game.moves.map((m) => m.move),
    game.firstSeat,
    game.seats.length,
  )

/** A Dots and Boxes game in play, with its board position. */
export function useDotsGame(id: string | undefined) {
  const session = useGameSession(id, 'dots-and-boxes', (game) => chooseEdge(positionOf(game).edges))
  const position = session.game ? positionOf(session.game) : null
  return { ...session, position }
}
