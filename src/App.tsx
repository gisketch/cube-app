import { useState, useCallback, useRef, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { GradientOrbs } from '@/components/gradient-orbs'
import { CubeViewer, type RubiksCubeRef } from '@/components/cube'
import { CubeNet } from '@/components/cube-net'
import { ScrambleDisplay } from '@/components/scramble-display'
import { TimerDisplay } from '@/components/timer-display'
import { SolvesList } from '@/components/solves-list'
import { useCubeState } from '@/hooks/useCubeState'
import { useCubeFaces } from '@/hooks/useCubeFaces'
import { useGanCube } from '@/hooks/useGanCube'
import { useScrambleTracker } from '@/hooks/useScrambleTracker'
import { useTimer } from '@/hooks/useTimer'
import { useSolves } from '@/hooks/useSolves'
import { ConnectionModal } from '@/components/connection-modal'
import { CalibrationModal } from '@/components/calibration-modal'
import { generateScramble } from '@/lib/cube-state'
import { DEFAULT_CONFIG } from '@/config/scene-config'

type TabType = 'timer' | 'solves'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('timer')
  const [isScrambling, setIsScrambling] = useState(false)
  const [frozenPattern, setFrozenPattern] = useState<typeof cubeState.pattern | null>(null)
  const cubeRef = useRef<RubiksCubeRef>(null)

  const { cubeState, isLoading, performMove: updateCubeState, reset: resetCubeState } = useCubeState()
  const {
    state: scrambleState,
    setScramble,
    performMove: trackMove,
    setSolved,
    startSolving,
    reset: resetScramble,
  } = useScrambleTracker()

  const timer = useTimer()
  const { solves, addSolve, deleteSolve } = useSolves()
  const { faces: cubeFaces, performMove: updateCubeFaces, reset: resetCubeFaces, isSolved: checkCubeSolved } = useCubeFaces()

  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false)

  useEffect(() => {
    if (cubeState?.pattern && !frozenPattern) {
      setFrozenPattern(cubeState.pattern)
    }
  }, [cubeState?.pattern, frozenPattern])

  useEffect(() => {
    const solved = checkCubeSolved()
    setSolved(solved)
    
    if (solved && timer.status === 'running') {
      const finalTime = timer.stopTimer()
      if (finalTime && scrambleState.originalScramble) {
        addSolve({
          time: finalTime,
          scramble: scrambleState.originalScramble,
          solution: scrambleState.solutionMoves,
        })
      }
    }
  }, [cubeFaces, checkCubeSolved, setSolved, timer, scrambleState.originalScramble, scrambleState.solutionMoves, addSolve])

  useEffect(() => {
    if (scrambleState.status === 'completed' && timer.status === 'idle') {
      timer.startInspection()
      startSolving()
    }
  }, [scrambleState.status, timer, startSolving])

  const handleMove = useCallback(
    (move: string) => {
      trackMove(move)
      cubeRef.current?.performMove(move)
      updateCubeState(move)
      updateCubeFaces(move)

      if (timer.status === 'inspection') {
        timer.startTimer()
      }
    },
    [trackMove, timer, updateCubeState, updateCubeFaces],
  )

  const {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    quaternionRef,
    resetGyro,
    error,
    clearError,
    isMacAddressRequired,
    submitMacAddress,
  } = useGanCube(handleMove)

  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  const handleNewScramble = useCallback(async () => {
    setIsScrambling(true)
    timer.reset()
    const scrambleAlg = await generateScramble()
    setScramble(scrambleAlg)
    setIsScrambling(false)
  }, [setScramble, timer])

  const handleSyncCube = useCallback(async () => {
    await resetCubeState()
    resetScramble()
    resetCubeFaces()
    timer.reset()
    const { createSolvedState } = await import('@/lib/cube-state')
    const solved = await createSolvedState()
    setFrozenPattern(solved.pattern)
    setIsCalibrationOpen(false)
  }, [resetCubeState, resetScramble, resetCubeFaces, timer])

  const handleRecalibrateGyro = useCallback(() => {
    resetGyro()
    setIsCalibrationOpen(false)
  }, [resetGyro])

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
    if (error || isMacAddressRequired) clearError()
  }

  return (
    <div className="fixed inset-0 bg-black">
      <GradientOrbs />

      <ConnectionModal
        isOpen={modalState.isOpen || isMacAddressRequired || !!error}
        onClose={closeModal}
        type={error || isMacAddressRequired ? 'error' : modalState.type}
        title={
          isMacAddressRequired
            ? 'Manual MAC Address Required'
            : error
              ? 'Connection Failed'
              : modalState.title
        }
        message={
          isMacAddressRequired
            ? 'Unable to determine cube MAC address automatically. Please enter it manually.'
            : error || modalState.message
        }
        isMacRequired={isMacAddressRequired}
        onSubmitMac={submitMacAddress}
      />

      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        pattern={cubeState?.pattern}
        onSyncCube={handleSyncCube}
        onRecalibrateGyro={handleRecalibrateGyro}
        isConnected={isConnected}
      />

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isConnected={isConnected}
        isConnecting={isConnecting}
        onConnect={connect}
        onDisconnect={disconnect}
        onResetGyro={resetGyro}
        onCalibrate={() => setIsCalibrationOpen(true)}
      />

      <main className="ml-16 flex h-full flex-col">
        {activeTab === 'timer' ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
            <ScrambleDisplay
              trackerState={scrambleState}
              onNewScramble={handleNewScramble}
              isLoading={isScrambling || isLoading}
            />

            <div className="flex items-center justify-center gap-6">
              <div className="relative aspect-square w-full max-w-md flex-shrink-0">
                {!isLoading && (
                  <CubeViewer
                    pattern={frozenPattern}
                    quaternionRef={quaternionRef}
                    cubeRef={cubeRef}
                    config={DEFAULT_CONFIG}
                  />
                )}
              </div>

              <CubeNet faces={cubeFaces} />
            </div>

            <TimerDisplay
              time={timer.time}
              status={timer.status}
              visible={scrambleState.status === 'completed' || scrambleState.status === 'solving' || timer.status !== 'idle'}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <h2 className="mb-4 text-lg font-medium text-white">Solve History</h2>
              <SolvesList solves={solves} onDelete={deleteSolve} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
