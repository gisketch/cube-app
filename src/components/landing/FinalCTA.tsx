import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl p-8 text-center md:p-16"
          style={{
            background: 'linear-gradient(135deg, var(--theme-accent) 0%, var(--theme-accent-secondary, var(--theme-accent)) 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl"
              style={{ backgroundColor: 'white' }}
            />
            <div
              className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full blur-3xl"
              style={{ backgroundColor: 'white' }}
            />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">100% Free • No credit card required</span>
            </motion.div>

            <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
              Ready to level up your cubing?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
              Join cubers who are tracking their progress, unlocking achievements, and
              climbing the leaderboards.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/app"
                className="group flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold transition-transform hover:scale-105"
                style={{ color: 'var(--theme-accent)' }}
              >
                Start Solving
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#features"
                className="rounded-xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                Learn More
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
