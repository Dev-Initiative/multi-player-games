import { MotionConfig } from 'motion/react'
import { CtaBanner } from '../features/homepage/ui/CtaBanner'
import { GamesSection } from '../features/homepage/ui/GamesSection'
import { Hero } from '../features/homepage/ui/Hero'
import { SiteFooter } from '../features/shared/ui/SiteFooter'
import { SiteNav } from '../features/shared/ui/SiteNav'
import { HowItWorks } from '../features/homepage/ui/HowItWorks'
import { LeaderboardSection } from '../features/homepage/ui/LeaderboardSection'
import { LiveTicker } from '../features/homepage/ui/LiveTicker'
import { StatsStrip } from '../features/homepage/ui/StatsStrip'

export function HomePage() {
  return (
    // Honour the OS "reduce motion" setting for every animation on the page.
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip">
        <SiteNav />
        <main>
          <Hero />
          <LiveTicker />
          <GamesSection />
          <HowItWorks />
          <LeaderboardSection />
          <div className="px-4 sm:px-8">
            <StatsStrip />
          </div>
          <CtaBanner />
        </main>
        <SiteFooter />
      </div>
    </MotionConfig>
  )
}
