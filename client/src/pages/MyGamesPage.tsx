import { MotionConfig } from 'motion/react'
import { MyGamesHeader } from '../features/my-games/ui/MyGamesHeader'
import { MyGamesList } from '../features/my-games/ui/MyGamesList'
import { SiteFooter } from '../features/shared/ui/SiteFooter'
import { SiteNav } from '../features/shared/ui/SiteNav'

export function MyGamesPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <SiteNav />
        <main className="mx-auto max-w-4xl px-4 pt-14 pb-28 sm:px-8">
          <MyGamesHeader />
          <MyGamesList />
        </main>
        <SiteFooter />
      </div>
    </MotionConfig>
  )
}
