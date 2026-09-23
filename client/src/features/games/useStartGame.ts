import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/context'
import { createConnect4Game } from './store'

// Stand-in opponents until invites by username exist.
const OPPONENTS = ['Grace Hopper', 'Linus T', 'Ada Lovelace', 'Barbara L', 'Alan Turing', 'Joan Clarke']

/** Start a Connect 4 game against a random stand-in opponent and open it. */
export function useStartConnect4() {
  const navigate = useNavigate()
  const { player } = useAuth()

  return () => {
    const opponent = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)]
    const id = createConnect4Game(player?.username ?? 'You', opponent)
    navigate(`/games/connect-4/${id}`)
  }
}
