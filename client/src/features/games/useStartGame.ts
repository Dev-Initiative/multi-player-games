import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/context'
import { createGame, gamePath, type GameType } from './store'

// Stand-in opponents for games without a setup screen yet.
const OPPONENTS = ['Grace Hopper', 'Linus T', 'Ada Lovelace', 'Barbara L', 'Alan Turing', 'Joan Clarke']

/** Games that have a playable board in this client. */
export const PLAYABLE: GameType[] = ['connect-4', 'dots-and-boxes']

export const isPlayable = (id: string): id is GameType => (PLAYABLE as string[]).includes(id)

/** Games whose "Play" opens a setup screen (invite, board, rules) instead of starting at once. */
const SETUP: Partial<Record<GameType, string>> = {
  'connect-4': '/games/connect-4/new',
}

/** Open a game's setup screen, or, for games without one yet, start against a random stand-in. */
export function useStartGame() {
  const navigate = useNavigate()
  const { player } = useAuth()

  return (type: GameType) => {
    const setup = SETUP[type]
    if (setup) return navigate(setup)
    const opponent = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)]
    const id = createGame(type, player?.username ?? 'You', [opponent])
    navigate(gamePath({ type, id }))
  }
}
