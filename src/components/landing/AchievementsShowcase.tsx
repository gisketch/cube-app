import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import {
  Trophy, Flame, Target, Cpu, Puzzle, Zap,
  Hash, Crown, Rocket, Dumbbell, Footprints, Crosshair,
  Waves, Gauge, Clover, Dices, Sparkles, Medal, Bug, Brain,
  type LucideIcon
} from 'lucide-react'
import { ACHIEVEMENTS, getAchievementsByCategory } from '@/lib/achievements'
import {
  TIER_COLORS,
  TIER_ORDER,
  type AchievementTier,
} from '@/types/achievements'

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  'hash': Hash,
  'trophy': Trophy,
  'crown': Crown,
  'rocket': Rocket,
  'dumbbell': Dumbbell,
  'footprints': Footprints,
  'crosshair': Crosshair,
  'waves': Waves,
  'zap': Zap,
  'gauge': Gauge,
  'clover': Clover,
  'dices': Dices,
  'sparkles': Sparkles,
  'medal': Medal,
  'bug': Bug,
  'brain': Brain,
  'flame': Flame,
  'target': Target,
  'cpu': Cpu,
  'puzzle': Puzzle,
}

function TierBadge({ tier, unlocked, size = 'sm' }: { tier: AchievementTier; unlocked: boolean; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'h-4 w-4 text-[8px]' : 'h-6 w-6 text-[10px]'

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center rounded-full font-bold uppercase`}
      style={{
        backgroundColor: unlocked ? TIER_COLORS[tier] : 'var(--theme-subAlt)',
        color: unlocked ? (tier === 'gold' || tier === 'diamond' ? '#000' : '#fff') : 'var(--theme-sub)',
        opacity: unlocked ? 1 : 0.5,
      }}
    >
      {tier.charAt(0)}
    </div>
  )
}

function AnimatedProgressBar({ maxValue, tiers }: {
  maxValue: number
  tiers: { tier: AchievementTier; requirement: number }[]
}) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const targetTier = Math.floor(Math.random() * tiers.length)
    const targetReq = tiers[targetTier].requirement
    const targetValue = Math.random() * targetReq * 1.2

    const animateProgress = () => {
      setAnimatedValue(prev => {
        const diff = targetValue - prev
        if (Math.abs(diff) < 1) return targetValue
        return prev + diff * 0.05
      })
    }

    const interval = setInterval(animateProgress, 50)
    return () => clearInterval(interval)
  }, [tiers])

  const percentage = Math.min((animatedValue / maxValue) * 100, 100)
  const unlockedTiers = tiers.filter(t => animatedValue >= t.requirement).map(t => t.tier)

  return (
    <div className="relative">
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: 'var(--theme-subAlt)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: 'var(--theme-accent)' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="absolute -top-1 left-0 right-0 flex justify-between">
        {tiers.map((t) => {
          const position = (t.requirement / maxValue) * 100
          const isUnlocked = unlockedTiers.includes(t.tier)
          return (
            <div
              key={t.tier}
              className="absolute -translate-x-1/2"
              style={{ left: `${Math.min(position, 100)}%` }}
            >
              <div
                className="h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors duration-300"
                style={{
                  backgroundColor: isUnlocked ? TIER_COLORS[t.tier] : 'var(--theme-bg)',
                  borderColor: isUnlocked ? TIER_COLORS[t.tier] : 'var(--theme-subAlt)',
                }}
              >
                {isUnlocked && <span className="text-[8px]">✓</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AchievementShowcaseCard({ achievement, delay }: { achievement: typeof ACHIEVEMENTS[0]; delay: number }) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const maxRequirement = Math.max(...achievement.tiers.map(t => t.requirement))

  useEffect(() => {
    const targetTier = Math.floor(Math.random() * achievement.tiers.length)
    const targetReq = achievement.tiers[targetTier].requirement
    const finalValue = Math.floor(Math.random() * targetReq * 1.3)

    const timer = setTimeout(() => {
      setAnimatedValue(finalValue)
    }, delay * 100)

    return () => clearTimeout(timer)
  }, [achievement.tiers, delay])

  const unlockedTiers = achievement.tiers.filter(t => animatedValue >= t.requirement).map(t => t.tier)
  const isComplete = unlockedTiers.length === achievement.tiers.length
  const highestTier = TIER_ORDER.filter(t => unlockedTiers.includes(t)).pop()
  const nextTier = achievement.tiers.find(t => !unlockedTiers.includes(t.tier))

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: "easeOut" }}
      className="rounded-lg p-3 transition-all"
      style={{
        backgroundColor: 'var(--theme-bg)',
        border: isComplete
          ? `2px solid ${TIER_COLORS[highestTier || 'bronze']}`
          : '1px solid var(--theme-subAlt)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
        >
          {(() => {
            const IconComponent = ACHIEVEMENT_ICONS[achievement.icon]
            return IconComponent ? <IconComponent className="h-5 w-5" style={{ color: 'var(--theme-accent)' }} /> : null
          })()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate" style={{ color: 'var(--theme-text)' }}>
              {achievement.name}
            </h4>
            {achievement.requiresSmartCube && (
              <Cpu className="h-3 w-3 shrink-0" style={{ color: 'var(--theme-accent)' }} />
            )}
          </div>
          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--theme-sub)' }}>
            {achievement.description}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1">
            {achievement.tiers.map(t => (
              <TierBadge key={t.tier} tier={t.tier} unlocked={unlockedTiers.includes(t.tier)} size="sm" />
            ))}
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--theme-sub)' }}>
            {animatedValue.toLocaleString()} / {(nextTier?.requirement || maxRequirement).toLocaleString()}
          </span>
        </div>
        <AnimatedProgressBar
          maxValue={maxRequirement}
          tiers={achievement.tiers}
        />
      </div>

      {nextTier && (
        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span style={{ color: 'var(--theme-sub)' }}>
            Next: {nextTier.tier.charAt(0).toUpperCase() + nextTier.tier.slice(1)}
          </span>
          <span style={{ color: 'var(--theme-accent)' }}>
            +{nextTier.xpReward} XP
          </span>
        </div>
      )}
    </motion.div>
  )
}

export function AchievementsShowcase() {
  const showcaseAchievements = useMemo(() => {
    const categories = ['grind', 'streak', 'cfop', 'smart-cube', 'anomaly'] as const
    const selected: typeof ACHIEVEMENTS[0][] = []

    for (const cat of categories) {
      const catAchievements = getAchievementsByCategory(cat)
      if (catAchievements.length > 0) {
        selected.push(catAchievements[Math.floor(Math.random() * catAchievements.length)])
      }
    }

    while (selected.length < 6) {
      const randomAch = ACHIEVEMENTS[Math.floor(Math.random() * ACHIEVEMENTS.length)]
      if (!selected.includes(randomAch)) {
        selected.push(randomAch)
      }
    }

    return selected.slice(0, 6)
  }, [])

  return (
    <section
      id="achievements"
      className="px-6 py-20"
      style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <h2
            className="mb-4 text-3xl font-bold md:text-4xl"
            style={{ color: 'var(--theme-text)' }}
          >
            50+ Achievements to Unlock
          </h2>
          <p
            className="mx-auto max-w-2xl text-lg"
            style={{ color: 'var(--theme-sub)' }}
          >
            From Bronze to Obsidian — each tier unlocks as you hit new milestones.
          </p>
        </motion.div>

        <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
          {TIER_ORDER.map((tier, index) => (
            <motion.div
              key={tier}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-2 rounded-full px-4 py-2"
              style={{
                backgroundColor: `${TIER_COLORS[tier]}20`,
                border: `2px solid ${TIER_COLORS[tier]}`,
              }}
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: TIER_COLORS[tier] }}
              />
              <span
                className="text-sm font-medium capitalize"
                style={{ color: 'var(--theme-text)' }}
              >
                {tier}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showcaseAchievements.map((achievement, index) => (
            <AchievementShowcaseCard key={achievement.id} achievement={achievement} delay={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          className="mt-8 text-center"
        >
          <p style={{ color: 'var(--theme-sub)' }}>
            Categories: Speed, CFOP, Grind, Streak, Anomaly, and more...
          </p>
        </motion.div>
      </div>
    </section>
  )
}
