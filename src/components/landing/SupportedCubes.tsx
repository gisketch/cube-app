import { motion } from 'framer-motion'
import { Bluetooth, Box } from 'lucide-react'

const SUPPORTED_CUBES = [
  {
    name: 'GAN 12 UI',
    description: 'Premium flagship with intelligent tracking',
  },
  {
    name: 'GAN 356i',
    description: 'Reliable smart cube for all levels',
  },
  {
    name: 'GAN 356i Carry',
    description: 'Portable with built-in battery',
  },
  {
    name: 'GAN 356i V3',
    description: 'Latest gen with improved sensors',
  },
]

export function SupportedCubes() {
  return (
    <section id="cubes" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <Bluetooth className="h-6 w-6" style={{ color: 'var(--theme-accent)' }} />
            <h2 className="text-3xl font-bold md:text-4xl" style={{ color: 'var(--theme-text)' }}>
              Supported Smart Cubes
            </h2>
          </div>
          <p className="mx-auto max-w-2xl text-lg" style={{ color: 'var(--theme-sub)' }}>
            Connect via Bluetooth for real-time move tracking, gyroscope data, and battery monitoring.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SUPPORTED_CUBES.map((cube, index) => (
            <motion.div
              key={cube.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className="rounded-xl p-6 text-center transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--theme-bg-secondary)', border: '1px solid var(--theme-sub-alt)' }}
            >
              <div className="mb-4 flex justify-center">
                <Box className="h-12 w-12" style={{ color: 'var(--theme-accent)' }} />
              </div>
              <h3 className="mb-2 font-bold" style={{ color: 'var(--theme-text)' }}>
                {cube.name}
              </h3>
              <p className="text-sm" style={{ color: 'var(--theme-sub)' }}>
                {cube.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-center"
          style={{ color: 'var(--theme-sub)' }}
        >
          More cubes coming soon • Manual timer also available
        </motion.p>
      </div>
    </section>
  )
}
