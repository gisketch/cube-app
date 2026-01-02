import { lazy, Suspense, useEffect } from 'react'
import { LandingNav } from '@/components/landing/LandingNav'
import { HeroSection } from '@/components/landing/HeroSection'
import { StatsBar } from '@/components/landing/StatsBar'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { AchievementsShowcase } from '@/components/landing/AchievementsShowcase'
import { LeaderboardPreview } from '@/components/landing/LeaderboardPreview'
import { SupportedCubes } from '@/components/landing/SupportedCubes'
import { MethodsSection } from '@/components/landing/MethodsSection'
import { RoadmapSection } from '@/components/landing/RoadmapSection'
import { CommunitySection } from '@/components/landing/CommunitySection'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { applyTheme } from '@/lib/themes'

const ReplayDemo = lazy(() => import('@/components/landing/ReplayDemo').then(m => ({ default: m.ReplayDemo })))

function ReplayLoader() {
  return (
    <div className="flex h-96 items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
        style={{ borderColor: 'var(--theme-accent)', borderTopColor: 'transparent' }}
      />
    </div>
  )
}

export function LandingPage() {
  useEffect(() => {
    applyTheme('kitsune')
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <LandingNav />
      
      <main>
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <AchievementsShowcase />
        
        <Suspense fallback={<ReplayLoader />}>
          <ReplayDemo />
        </Suspense>
        
        <LeaderboardPreview />
        <SupportedCubes />
        <MethodsSection />
        <RoadmapSection />
        <CommunitySection />
        <FinalCTA />
      </main>
      
      <LandingFooter />
    </div>
  )
}
