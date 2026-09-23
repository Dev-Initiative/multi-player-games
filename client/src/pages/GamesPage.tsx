import { MotionConfig } from 'motion/react'
import { FeaturedGame } from '../features/games/ui/FeaturedGame'
import { GameLibrary } from '../features/games/ui/GameLibrary'
import { GamesHeader } from '../features/games/ui/GamesHeader'
import { SuggestGame } from '../features/games/ui/SuggestGame'
import { SiteFooter } from '../features/shared/ui/SiteFooter'
import { SiteNav } from '../features/shared/ui/SiteNav'

export function GamesPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip">
        <SiteNav />
        <main className="mx-auto max-w-7xl px-4 pt-14 pb-28 sm:px-8">
          <GamesHeader />
          <FeaturedGame />
          <GameLibrary />
          <SuggestGame />
        </main>
        <SiteFooter />
      </div>
    </MotionConfig>
  )
}
