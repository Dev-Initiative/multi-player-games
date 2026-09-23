import { useEffect } from 'react'
import { playMove, position, resign, statusOf, useGame, yourSeat } from '../games/store'
import { chooseColumn } from './bot'

/**
 * Everything the Connect 4 screen needs for one game. The opponent is a local
 * bot for now; with a server, its move would arrive over the push channel
 * instead and this hook would only re-read the game.
 */
export function useConnect4Game(id: string | undefined) {
  const game = useGame(id)
  const pos = game ? position(game) : null
  const you = game ? yourSeat(game) : -1
  const status = game ? statusOf(game) : null
  const opponentToMove = status === 'their-turn'

  useEffect(() => {
    if (!game || !pos || !opponentToMove || pos.currentSeat === null) return
    const seat = pos.currentSeat
    // A pause long enough to feel like someone is thinking.
    const timer = setTimeout(() => playMove(game.id, seat, chooseColumn(pos.board, seat)), 700 + Math.random() * 900)
    return () => clearTimeout(timer)
    // Re-run only when a move lands, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.id, game?.moves.length, opponentToMove])

  return {
    game,
    position: pos,
    status,
    you,
    opponent: you === -1 ? -1 : 1 - you,
    play: (column: number) => {
      if (game && status === 'your-turn') playMove(game.id, you, column)
    },
    resign: () => {
      if (game) resign(game.id, you)
    },
  }
}
