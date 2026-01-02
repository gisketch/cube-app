import { motion } from 'framer-motion'
import { BarChart3, Layers } from 'lucide-react'

const METHODS = [
  {
    name: 'CFOP',
    fullName: 'Fridrich Method',
    description: 'Cross → F2L → OLL → PLL. The most popular speedcubing method with full phase analysis.',
    phases: ['Cross', 'F2L (4 pairs)', 'OLL', 'PLL'],
    supported: true,
  },
  {
    name: 'Roux',
    fullName: 'Roux Method',
    description: 'Block building approach. Left block → Right block → CMLL → LSE.',
    phases: ['1st Block', '2nd Block', 'CMLL', 'LSE'],
    supported: false,
    comingSoon: true,
  },
  {
    name: 'ZZ',
    fullName: 'ZZ Method',
    description: 'EOLine start with reduced cube. Popular for one-handed solving.',
    phases: ['EOLine', 'F2L', 'LL'],
    supported: false,
    comingSoon: true,
  },
]

export function MethodsSection() {
  return (
    <section
      id="methods"
      className="px-6 py-20"
      style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <BarChart3 className="h-6 w-6" style={{ color: 'var(--theme-accent)' }} />
            <h2 className="text-3xl font-bold md:text-4xl" style={{ color: 'var(--theme-text)' }}>
              Method Analysis
            </h2>
          </div>
          <p className="mx-auto max-w-2xl text-lg" style={{ color: 'var(--theme-sub)' }}>
            Automatic phase detection and timing breakdown for your solving method.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {METHODS.map((method, index) => (
            <motion.div
              key={method.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className="relative overflow-hidden rounded-xl p-6 transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--theme-bg)',
                border: `1px solid ${method.supported ? 'var(--theme-accent)' : 'var(--theme-sub-alt)'}`,
                opacity: method.supported ? 1 : 0.7,
              }}
            >
              {method.comingSoon && (
                <div
                  className="absolute right-0 top-0 rounded-bl-lg px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: 'var(--theme-sub-alt)', color: 'var(--theme-sub)' }}
                >
                  Coming Soon
                </div>
              )}

              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: method.supported ? 'var(--theme-accent)' : 'var(--theme-sub-alt)',
                  }}
                >
                  <Layers
                    className="h-6 w-6"
                    style={{ color: method.supported ? 'var(--theme-bg)' : 'var(--theme-sub)' }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                    {method.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--theme-sub)' }}>
                    {method.fullName}
                  </p>
                </div>
              </div>

              <p className="mb-4 text-sm" style={{ color: 'var(--theme-sub)' }}>
                {method.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {method.phases.map((phase) => (
                  <span
                    key={phase}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: method.supported ? 'var(--theme-accent)20' : 'var(--theme-sub-alt)',
                      color: method.supported ? 'var(--theme-accent)' : 'var(--theme-sub)',
                    }}
                  >
                    {phase}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
