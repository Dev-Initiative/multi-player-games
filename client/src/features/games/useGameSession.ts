import { useEffect } from 'react'
import {
  answerInvite,
  cancelGame,
  isInPlay,
  outcome,
  phaseOf,
  playMove,
  resign,
  statusOf,
  useGame,
  winnerOf,
  yourSeat,
  type GameRecord,
  type GameType,
} from './store'

/**
 * One game in play: your moves, and the stand-in opponent's replies. With a
 * server, the opponent's accept and moves would arrive over the push channel
 * instead and this hook would only re-read the game.
 */
export function useGameSession(id: string | undefined, type: GameType, botMove: (game: GameRecord, seat: number) => number) {
  const game = useGame(id, type)
  const status = game ? statusOf(game) : null
  const inPlay = status !== null && isInPlay(status)
  const current = game && inPlay ? outcome(game).currentSeat : null
  const opponentToMove = status === 'their-turn'
  const pendingSeat = game && phaseOf(game) === 'lobby' ? game.seats.findIndex((s) => s.invite === 'pending') : -1

  // Stand-in invitee: sees the invite and accepts a few seconds later.
  useEffect(() => {
    if (!game || pendingSeat === -1) return
    const timer = setTimeout(() => answerInvite(game.id, pendingSeat, 'accepted'), 2500 + Math.random() * 2500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.id, pendingSeat])

  // Stand-in opponent: a pause long enough to feel like someone is thinking.
  useEffect(() => {
    if (!game || !opponentToMove || current === null) return
    const timer = setTimeout(() => playMove(game.id, current, botMove(game, current)), 700 + Math.random() * 900)
    return () => clearTimeout(timer)
    // Re-run when a move lands (including a second move in a row), not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.id, game?.moves.length, opponentToMove])

  const you = game ? yourSeat(game) : -1

  return {
    game,
    status,
    you,
    opponent: game ? game.seats.findIndex((_, i) => i !== you) : -1,
    currentSeat: current,
    winner: game ? winnerOf(game) : null,
    play: (move: number) => {
      if (game && status === 'your-turn') playMove(game.id, you, move)
    },
    resign: () => {
      if (game) resign(game.id, you)
    },
    cancel: () => {
      if (game) cancelGame(game.id)
    },
  }
}
