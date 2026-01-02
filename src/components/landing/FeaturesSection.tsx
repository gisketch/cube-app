import { motion } from 'framer-motion'
import { Gamepad2, Trophy, BarChart3, Play, Bluetooth, Palette } from 'lucide-react'

const FEATURES = [
  {
    icon: Gamepad2,
    title: 'Gamification',
    description: 'XP & leveling system. Faster solves = more XP. Level up and show off your progress.',
  },
  {
    icon: Trophy,
    title: '50+ Achievements',
    description: 'Tiered badges from Bronze to Obsidian. Grind, CFOP, streaks, anomalies, and more.',
  },
  {
    icon: BarChart3,
    title: 'CFOP Analysis',
    description: 'Phase breakdown: Cross, F2L pairs, OLL, PLL. Track TPS and move timing.',
  },
  {
    icon: Play,
    title: 'Full Replays',
    description: 'Watch any solve with gyroscope playback. Share replays with a link.',
  },
  {
    icon: Bluetooth,
    title: 'Smart Cube',
    description: 'Bluetooth connection with real-time move tracking. Battery monitoring included.',
  },
  {
    icon: Palette,
    title: '10+ Themes',
    description: 'Kitsune, Dark, Serika, Nord, Dracula, and more. Match your style.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-20">
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
            Everything you need to improve
          </h2>
          <p
            className="mx-auto max-w-2xl text-lg"
            style={{ color: 'var(--theme-sub)' }}
          >
            Track every solve, analyze your performance, and compete with cubers worldwide.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className="rounded-xl p-6 transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--theme-bg-secondary)',
                border: '1px solid var(--theme-sub-alt)',
              }}
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'var(--theme-sub-alt)' }}
              >
                <feature.icon className="h-6 w-6" style={{ color: 'var(--theme-accent)' }} />
              </div>
              <h3
                className="mb-2 text-xl font-semibold"
                style={{ color: 'var(--theme-text)' }}
              >
                {feature.title}
              </h3>
              <p style={{ color: 'var(--theme-sub)' }}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
