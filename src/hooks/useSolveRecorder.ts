import { useEffect, useRef } from 'react'
import { useSolveSession } from '@/contexts/SolveSessionContext'
import type { CubeFaces } from '@/lib/cube-faces'

interface UseSolveRecorderParams {
  checkCubeSolved: () => boolean
  getHistory: () => { moves: string[]; states: CubeFaces[] }
  isSolved: boolean
  setSolved: (solved: boolean) => void
  syncWithFacelets: (facelets: string) => void
  scrambleStatus: 'idle' | 'scrambling' | 'completed' | 'solving' | 'diverged'
  originalScramble: string | null
  solvedFacelets: string
}

export function useSolveRecorder({
  checkCubeSolved,
  getHistory,
  isSolved,
  setSolved,
  syncWithFacelets,
  scrambleStatus,
  originalScramble,
  solvedFacelets,
}: UseSolveRecorderParams) {
  const {
    timer,
    gyroRecorder,
    solveSaved,
    saveSolve,
  } = useSolveSession()

  const solveSavedRef = useRef(solveSaved)
  solveSavedRef.current = solveSaved

  useEffect(() => {
    const solved = checkCubeSolved()

    if (solved !== isSolved) {
      setSolved(solved)
    }

    if (solved && (scrambleStatus === 'scrambling' || scrambleStatus === 'diverged')) {
      syncWithFacelets(solvedFacelets)
    }

    if (solved && timer.status === 'running' && !solveSavedRef.current) {
      const finalTime = timer.stopTimer()
      if (finalTime && originalScramble) {
        const history = getHistory()
        const recordedData = gyroRecorder.stopRecording()

        saveSolve({
          time: finalTime,
          scramble: originalScramble,
          solution: history.moves,
          states: history.states,
          isManual: false,
          gyroData: recordedData.gyroData,
          moveTimings: recordedData.moveTimings,
        })
      }
    }
  }, [
    checkCubeSolved,
    isSolved,
    setSolved,
    syncWithFacelets,
    scrambleStatus,
    originalScramble,
    solvedFacelets,
    timer,
    gyroRecorder,
    saveSolve,
  ])
}

interface UseManualSolveRecorderParams {
  manualScramble: string
}

export function useManualSolveRecorder({ manualScramble }: UseManualSolveRecorderParams) {
  const { manualTimer, manualTimerEnabled, solveSaved, saveSolve } = useSolveSession()

  const solveSavedRef = useRef(solveSaved)
  solveSavedRef.current = solveSaved

  useEffect(() => {
    if (
      manualTimer.status === 'stopped' &&
      manualTimerEnabled &&
      manualScramble &&
      !solveSavedRef.current
    ) {
      saveSolve({
        time: manualTimer.time,
        scramble: manualScramble,
        solution: [],
        isManual: true,
      })
    }
  }, [manualTimer.status, manualTimer.time, manualTimerEnabled, manualScramble, saveSolve])
}
