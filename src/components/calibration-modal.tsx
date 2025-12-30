import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw, RefreshCw } from 'lucide-react'
import { CubeViewer, type RubiksCubeRef } from '@/components/cube'
import type { KPattern } from 'cubing/kpuzzle'
import { useRef } from 'react'
import * as THREE from 'three'

interface CalibrationModalProps {
  isOpen: boolean
  onClose: () => void
  pattern?: KPattern | null
  onSyncCube: () => void
  onRecalibrateGyro: () => void
  isConnected: boolean
}

export function CalibrationModal({
  isOpen,
  onClose,
  pattern,
  onSyncCube,
  onRecalibrateGyro,
  isConnected,
}: CalibrationModalProps) {
  const cubeRef = useRef<RubiksCubeRef>(null)
  const quaternionRef = useRef(new THREE.Quaternion())

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/95 p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Cube Calibration</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 aspect-square w-full overflow-hidden rounded-xl bg-black/50">
              <CubeViewer pattern={pattern} quaternionRef={quaternionRef} cubeRef={cubeRef} />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onSyncCube}
                disabled={!isConnected}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Sync Cube</span>
              </button>
              <p className="text-center text-xs text-white/40">
                Make sure the physical cube is solved, then press to sync the virtual cube
              </p>

              <div className="my-2 h-px bg-white/10" />

              <button
                onClick={onRecalibrateGyro}
                disabled={!isConnected}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-medium text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Recalibrate Gyro</span>
              </button>
              <p className="text-center text-xs text-white/40">
                Hold the cube with white on top and green facing you, then press to reset gyro
              </p>
            </div>

            {!isConnected && (
              <div className="mt-4 rounded-lg bg-yellow-500/10 p-3 text-center text-sm text-yellow-500">
                Connect your cube first to enable calibration
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
