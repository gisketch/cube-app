import { motion, AnimatePresence } from 'framer-motion'
import type { TimerStatus } from '@/hooks/useTimer'

interface TimerDisplayProps {
  time: number
  status: TimerStatus
  visible: boolean
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const centiseconds = Math.floor((ms % 1000) / 10)

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }
  return `${seconds}.${centiseconds.toString().padStart(2, '0')}`
}

export function TimerDisplay({ time, status, visible }: TimerDisplayProps) {
  const statusText =
    status === 'inspection'
      ? 'Inspection - make a move to start'
      : status === 'running'
        ? 'Solving...'
        : status === 'stopped'
          ? 'Solved!'
          : 'Ready'

  const colorClass =
    status === 'running'
      ? 'text-green-400'
      : status === 'stopped'
        ? 'text-blue-400'
        : status === 'inspection'
          ? 'text-yellow-400'
          : ''

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <div
            className={`font-mono text-6xl font-light tracking-tight transition-colors ${colorClass}`}
            style={status === 'idle' ? { color: 'var(--theme-text)' } : undefined}
          >
            {formatTime(time)}
          </div>
          <div className="mt-2 text-sm" style={{ color: 'var(--theme-sub)' }}>
            {statusText}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
