import { useState, useCallback, useRef, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { GradientOrbs } from '@/components/gradient-orbs'
import { CubeViewer, type RubiksCubeRef } from '@/components/cube'
import { CubeNet } from '@/components/cube-net'
import { ScrambleDisplay } from '@/components/scramble-display'
import { TimerDisplay } from '@/components/timer-display'
import { SolvesList } from '@/components/solves-list'
import { CFOPAnalysisDisplay } from '@/components/cfop-analysis'
import { Simulator } from '@/components/simulator'
import { useCubeState } from '@/hooks/useCubeState'
import { useCubeFaces } from '@/hooks/useCubeFaces'
import { useGanCube } from '@/hooks/useGanCube'
import { useScrambleTracker } from '@/hooks/useScrambleTracker'
import { useTimer } from '@/hooks/useTimer'
import { useSolves } from '@/hooks/useSolves'
import { ConnectionModal } from '@/components/connection-modal'
import { CalibrationModal } from '@/components/calibration-modal'
import { generateScramble } from '@/lib/cube-state'
import { analyzeCFOP, type CFOPAnalysis } from '@/lib/cfop-analyzer'
import { DEFAULT_CONFIG } from '@/config/scene-config'
import type { KPattern } from 'cubing/kpuzzle'

type TabType = 'timer' | 'solves' | 'simulator'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('timer')
  const [isScrambling, setIsScrambling] = useState(false)
  const [frozenPattern, setFrozenPattern] = useState<KPattern | null>(null)
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
  const { 
    faces: cubeFaces, 
    performMove: updateCubeFaces, 
    reset: resetCubeFaces, 
    isSolved: checkCubeSolved,
    getHistory,
    clearHistory,
    applyScramble 
  } = useCubeFaces()
  const [lastAnalysis, setLastAnalysis] = useState<CFOPAnalysis | null>(null)

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
        const history = getHistory()
        const analysis = analyzeCFOP(history.moves, history.states)
        setLastAnalysis(analysis)
        
        addSolve({
          time: finalTime,
          scramble: scrambleState.originalScramble,
          solution: history.moves,
          cfopAnalysis: analysis || undefined,
        })
      }
    }
  }, [cubeFaces, checkCubeSolved, setSolved, timer, scrambleState.originalScramble, addSolve, getHistory])

  useEffect(() => {
    if (scrambleState.status === 'completed' && timer.status === 'idle') {
      if (scrambleState.originalScramble) {
        applyScramble(scrambleState.originalScramble)
      }
      timer.startInspection()
      startSolving()
    }
  }, [scrambleState.status, scrambleState.originalScramble, timer, startSolving, applyScramble])

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
    clearHistory()
    setLastAnalysis(null)
    const scrambleAlg = await generateScramble()
    setScramble(scrambleAlg)
    setIsScrambling(false)
  }, [setScramble, timer, clearHistory])

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

              <div className="flex flex-col gap-4">
                <CubeNet faces={cubeFaces} />
                {lastAnalysis && <CFOPAnalysisDisplay analysis={lastAnalysis} />}
              </div>
            </div>

            <TimerDisplay
              time={timer.time}
              status={timer.status}
              visible={scrambleState.status === 'completed' || scrambleState.status === 'solving' || timer.status !== 'idle'}
            />
          </div>
        ) : activeTab === 'solves' ? (
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <h2 className="mb-4 text-lg font-medium text-white">Solve History</h2>
              <SolvesList solves={solves} onDelete={deleteSolve} />
            </div>
          </div>
        ) : (
          <Simulator />
        )}
      </main>
    </div>
  )
}

export default App
