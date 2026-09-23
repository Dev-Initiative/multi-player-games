import { Gamepad2 } from 'lucide-react'
import { Link } from 'react-router'
import { buttonStyles } from '../../shared/ui/buttonStyles'
import { EmptyState } from '../../shared/ui/EmptyState'

/** Placeholder until games are saved again: there is nothing to list yet. */
export function MyGamesList() {
  return (
    <EmptyState
      icon={Gamepad2}
      title="No games yet"
      action={
        <Link to="/games" className={buttonStyles()}>
          Browse games
        </Link>
      }
    >
      Pick a game from the library to see its board.
    </EmptyState>
  )
}
