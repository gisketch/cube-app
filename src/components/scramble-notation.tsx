import { motion, AnimatePresence } from 'framer-motion'
import { formatTime } from '@/lib/format'
import type { ScrambleTrackerState, ScrambleMoveState, ParsedMove } from '@/hooks/useScrambleTracker'

interface ScrambleNotationProps {
  trackerState: ScrambleTrackerState
  timerStatus: 'idle' | 'inspection' | 'running' | 'stopped'
  time: number
}

function MoveNotation({
  move,
  status,
}: {
  move: string
  status: 'pending' | 'current' | 'completed' | 'recovery'
}) {
  const isCurrent = status === 'current'
  const isCompleted = status === 'completed'
  const isRecovery = status === 'recovery'
  const isPending = status === 'pending'

  const getColor = () => {
    if (isRecovery) return 'var(--theme-error)'
    if (isCurrent) return 'var(--theme-accent)'
    if (isCompleted) return 'var(--theme-accent)'
    return 'var(--theme-text)'
  }

  return (
    <motion.span
      layout
      initial={{ opacity: 0.6, scale: 1 }}
      animate={{ 
        opacity: isCurrent || isRecovery ? 1 : isCompleted ? 0.6 : 0.7,
        scale: isCurrent || isRecovery ? 1.15 : 1,
        color: getColor()
      }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`inline-block ${isCurrent || isRecovery ? 'font-bold' : isPending ? 'font-normal' : 'font-medium'}`}
    >
      {move}
    </motion.span>
  )
}

function RecoveryMoveNotation({ move }: { move: ParsedMove }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8, x: -10 }}
      animate={{ 
        opacity: 1,
        scale: 1.15,
        x: 0,
        color: 'var(--theme-error, #ef4444)'
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="inline-block font-bold"
    >
      {move.original}
    </motion.span>
  )
}

export function ScrambleNotation({ trackerState, timerStatus, time }: ScrambleNotationProps) {
  const { status, moves, originalScramble, recoveryMoves } = trackerState
  const isScrambling = status === 'scrambling'
  const isDiverged = status === 'diverged'
  const showScrambleMoves = isScrambling || isDiverged
  const isInspection = timerStatus === 'inspection'
  const isRunning = timerStatus === 'running'
  const isStopped = timerStatus === 'stopped'

  return (
    <div className="flex min-h-[80px] flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {!originalScramble && status === 'idle' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="text-2xl tracking-widest"
            style={{ color: 'var(--theme-sub)' }}
          >
            generating...
          </motion.div>
        )}

        {showScrambleMoves && (
          <motion.div
            key="scramble"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              layout
              className="flex max-w-xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-2xl tracking-wide"
            >
              {moves.map((moveState: ScrambleMoveState, i: number) => (
                <MoveNotation
                  key={`move-${i}`}
                  move={moveState.move.original}
                  status={moveState.status}
                />
              ))}
            </motion.div>
            <AnimatePresence>
              {isDiverged && recoveryMoves.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex items-center gap-2"
                >
                  <span 
                    className="text-sm"
                    style={{ color: 'var(--theme-error, #ef4444)' }}
                  >
                    undo:
                  </span>
                  <div className="flex gap-2 text-xl">
                    {recoveryMoves.map((move, i) => (
                      <RecoveryMoveNotation key={`recovery-${i}`} move={move} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {(status === 'completed' || status === 'solving') && isInspection && (
          <motion.div
            key="inspection"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-3xl font-medium tracking-widest"
            style={{ color: 'var(--theme-accent)' }}
          >
            inspecting...
          </motion.div>
        )}

        {isRunning && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-7xl font-bold tabular-nums tracking-tight"
            style={{ color: 'var(--theme-text)' }}
          >
            {formatTime(time)}
          </motion.div>
        )}

        {isStopped && (
          <motion.div
            key="stopped"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-7xl font-bold tabular-nums tracking-tight"
            style={{ color: 'var(--theme-accent)' }}
          >
            {formatTime(time)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
