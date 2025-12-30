import { useCallback, useRef } from 'react'
import type { MoveWithTime, CalibrationType } from '@/types'
import { CALIBRATION_SEQUENCE_TIMEOUT } from '@/lib/constants'

interface CalibrationActions {
  resetGyro: () => void
  syncCube: () => void
}

export function useCalibrationSequence() {
  const recentMovesRef = useRef<MoveWithTime[]>([])
  const actionsRef = useRef<CalibrationActions>({
    resetGyro: () => {},
    syncCube: () => {},
  })

  const setActions = useCallback((actions: CalibrationActions) => {
    actionsRef.current = actions
  }, [])

  const checkSequence = useCallback((move: string): CalibrationType => {
    const now = Date.now()
    recentMovesRef.current.push({ move, time: now })

    recentMovesRef.current = recentMovesRef.current.filter(
      (m) => now - m.time < CALIBRATION_SEQUENCE_TIMEOUT,
    )

    const recentMoves = recentMovesRef.current.map((m) => m.move)

    if (recentMoves.length >= 4) {
      const lastFour = recentMoves.slice(-4)

      if (lastFour.every((m) => m === 'U' || m === "U'")) {
        const uCount = lastFour.filter((m) => m === 'U').length
        const uPrimeCount = lastFour.filter((m) => m === "U'").length
        if (uCount === 4 || uPrimeCount === 4 || (uCount === 2 && uPrimeCount === 2)) {
          recentMovesRef.current = []
          return 'gyro'
        }
      }

      if (lastFour.every((m) => m === 'F' || m === "F'")) {
        const fCount = lastFour.filter((m) => m === 'F').length
        const fPrimeCount = lastFour.filter((m) => m === "F'").length
        if (fCount === 4 || fPrimeCount === 4 || (fCount === 2 && fPrimeCount === 2)) {
          recentMovesRef.current = []
          return 'cube'
        }
      }
    }

    return null
  }, [])

  const handleCalibration = useCallback(
    (move: string): boolean => {
      const calibration = checkSequence(move)
      if (calibration === 'gyro') {
        actionsRef.current.resetGyro()
        return true
      }
      if (calibration === 'cube') {
        actionsRef.current.syncCube()
        return true
      }
      return false
    },
    [checkSequence],
  )

  return {
    checkSequence,
    handleCalibration,
    setActions,
  }
}
