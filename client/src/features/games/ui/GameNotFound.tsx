import { SearchX } from 'lucide-react'
import { Link } from 'react-router'
import { buttonStyles } from '../../shared/ui/buttonStyles'
import { EmptyState } from '../../shared/ui/EmptyState'
import { SiteNav } from '../../shared/ui/SiteNav'

export function GameNotFound() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-xl px-4 py-24">
        <EmptyState
          icon={SearchX}
          title="Game not found"
          action={
            <Link to="/my-games" className={buttonStyles()}>
              Back to my games
            </Link>
          }
        >
          It may have been started on another device. Games live on this browser until the server is connected.
        </EmptyState>
      </main>
    </div>
  )
}
