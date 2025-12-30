import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { StatusBar } from '@/components/layout/StatusBar'
import { KeyboardHints } from '@/components/keyboard-hints'
import { CommandPalette } from '@/components/command-palette'
import { CubeViewer, type RubiksCubeRef, type CubeColors } from '@/components/cube'
import { ScrambleNotation } from '@/components/scramble-notation'
import { SolveResults } from '@/components/solve-results'
import { SolvesList } from '@/components/solves-list'
import { SolveDetailPage } from '@/components/solve-detail-page'
import { Simulator } from '@/components/simulator'
import { SettingsPanel } from '@/components/settings-panel'
import { useCubeState } from '@/hooks/useCubeState'
import { useCubeFaces } from '@/hooks/useCubeFaces'
import { useGanCube } from '@/hooks/useGanCube'
import { useScrambleTracker } from '@/hooks/useScrambleTracker'
import { useTimer } from '@/hooks/useTimer'
import { useSolves, type Solve } from '@/hooks/useSolves'
import { useGyroRecorder } from '@/hooks/useGyroRecorder'
import { useSettings } from '@/hooks/useSettings'
import { ConnectionModal } from '@/components/connection-modal'
import { CalibrationModal } from '@/components/calibration-modal'
import { CubeInfoModal } from '@/components/cube-info-modal'
import { generateScramble } from '@/lib/cube-state'
import { setCubeColors } from '@/lib/cube-state'
import { setCubeFaceColors } from '@/lib/cube-faces'
import { getCubeColors } from '@/lib/themes'
import { analyzeCFOP, type CFOPAnalysis } from '@/lib/cfop-analyzer'
import { DEFAULT_CONFIG } from '@/config/scene-config'
import type { KPattern } from 'cubing/kpuzzle'

type TabType = 'timer' | 'solves' | 'simulator' | 'settings'
type SolveViewMode = 'list' | 'results' | 'stats' | 'replay'

interface MoveWithTime {
  move: string
  time: number
}

const CALIBRATION_SEQUENCE_TIMEOUT = 800

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('timer')
  const [_isScrambling, setIsScrambling] = useState(false)
  const [frozenPattern, setFrozenPattern] = useState<KPattern | null>(null)
  const [selectedSolve, setSelectedSolve] = useState<Solve | null>(null)
  const [solveViewMode, setSolveViewMode] = useState<SolveViewMode>('list')
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const cubeRef = useRef<RubiksCubeRef>(null)
  const recentMovesRef = useRef<MoveWithTime[]>([])

  const { cubeState, isLoading, performMove: updateCubeState, reset: resetCubeState } = useCubeState()
  const {
    state: scrambleState,
    setScramble,
    performMove: trackMove,
    setSolved,
    startSolving,
  } = useScrambleTracker()

  const timer = useTimer()
  const { solves, addSolve, deleteSolve } = useSolves()
  const { settings } = useSettings()
  const gyroRecorder = useGyroRecorder()

  const cubeColorValues = useMemo(() => 
    getCubeColors(settings.cubeTheme, settings.theme),
    [settings.cubeTheme, settings.theme]
  )

  const cubeColors: CubeColors = useMemo(() => ({
    white: cubeColorValues.cubeWhite,
    yellow: cubeColorValues.cubeYellow,
    green: cubeColorValues.cubeGreen,
    blue: cubeColorValues.cubeBlue,
    red: cubeColorValues.cubeRed,
    orange: cubeColorValues.cubeOrange,
    inner: '#0a0a0a',
  }), [cubeColorValues])

  useEffect(() => {
    setCubeColors(cubeColorValues as Parameters<typeof setCubeColors>[0])
    setCubeFaceColors(cubeColorValues as Parameters<typeof setCubeFaceColors>[0])
  }, [cubeColorValues])
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
  const [lastSolveTime, setLastSolveTime] = useState<number>(0)
  const [lastMoveCount, setLastMoveCount] = useState<number>(0)
  const [lastScramble, setLastScramble] = useState<string>('')

  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false)
  const [isCubeInfoOpen, setIsCubeInfoOpen] = useState(false)
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    if (cubeState?.pattern && !frozenPattern) {
      setFrozenPattern(cubeState.pattern)
    }
  }, [cubeState?.pattern, frozenPattern])

  useEffect(() => {
    const solved = checkCubeSolved()
    
    if (solved !== scrambleState.isSolved) {
      setSolved(solved)
    }
    
    if (solved && timer.status === 'running') {
      const finalTime = timer.stopTimer()
      if (finalTime && scrambleState.originalScramble) {
        const history = getHistory()
        const analysis = analyzeCFOP(history.moves, history.states)
        setLastAnalysis(analysis)
        setLastSolveTime(finalTime)
        setLastMoveCount(history.moves.length)
        setLastScramble(scrambleState.originalScramble)
        
        const recordedData = gyroRecorder.stopRecording()
        
        addSolve({
          time: finalTime,
          scramble: scrambleState.originalScramble,
          solution: history.moves,
          cfopAnalysis: analysis || undefined,
          gyroData: recordedData.gyroData.length > 0 ? recordedData.gyroData : undefined,
          moveTimings: recordedData.moveTimings.length > 0 ? recordedData.moveTimings : undefined,
        })
      }
    }
  }, [cubeFaces, checkCubeSolved, setSolved, timer, scrambleState.originalScramble, scrambleState.isSolved, addSolve, getHistory, gyroRecorder])

  useEffect(() => {
    if (scrambleState.status === 'completed' && timer.status === 'idle') {
      if (scrambleState.originalScramble) {
        applyScramble(scrambleState.originalScramble)
      }
      timer.startInspection()
      startSolving()
      gyroRecorder.startRecording()
    }
  }, [scrambleState.status, scrambleState.originalScramble, timer, startSolving, applyScramble, gyroRecorder])

  const calibrationActionsRef = useRef<{ resetGyro: () => void; syncCube: () => void }>({
    resetGyro: () => {},
    syncCube: () => {},
  })

  const checkCalibrationSequence = useCallback((move: string): 'gyro' | 'cube' | null => {
    const now = Date.now()
    recentMovesRef.current.push({ move, time: now })
    
    recentMovesRef.current = recentMovesRef.current.filter(
      (m) => now - m.time < CALIBRATION_SEQUENCE_TIMEOUT
    )
    
    const recentMoves = recentMovesRef.current.map((m) => m.move)
    
    if (recentMoves.length >= 4) {
      const lastFour = recentMoves.slice(-4)
      if (lastFour.every((m) => m === 'U' || m === "U'")) {
        const uCount = lastFour.filter((m) => m === 'U').length
        const uPrimeCount = lastFour.filter((m) => m === "U'").length
        if ((uCount === 4) || (uPrimeCount === 4) || (uCount === 2 && uPrimeCount === 2)) {
          recentMovesRef.current = []
          return 'gyro'
        }
      }
      if (lastFour.every((m) => m === 'F' || m === "F'")) {
        const fCount = lastFour.filter((m) => m === 'F').length
        const fPrimeCount = lastFour.filter((m) => m === "F'").length
        if ((fCount === 4) || (fPrimeCount === 4) || (fCount === 2 && fPrimeCount === 2)) {
          recentMovesRef.current = []
          return 'cube'
        }
      }
    }
    
    return null
  }, [])

  const handleMove = useCallback(
    (move: string) => {
      cubeRef.current?.performMove(move)
      updateCubeState(move)
      updateCubeFaces(move)

      const calibration = checkCalibrationSequence(move)
      if (calibration === 'gyro') {
        calibrationActionsRef.current.resetGyro()
        return
      }
      if (calibration === 'cube') {
        calibrationActionsRef.current.syncCube()
        return
      }

      trackMove(move)
      gyroRecorder.recordMove(move)

      if (timer.status === 'inspection') {
        timer.startTimer()
      }
    },
    [trackMove, timer, updateCubeState, updateCubeFaces, gyroRecorder, checkCalibrationSequence],
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
    batteryLevel,
  } = useGanCube(handleMove)

  useEffect(() => {
    if (!gyroRecorder.isRecording() || !isConnected) return
    
    const interval = setInterval(() => {
      gyroRecorder.recordGyroFrame(quaternionRef.current)
    }, 50)
    
    return () => clearInterval(interval)
  }, [isConnected, gyroRecorder, quaternionRef])

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
    setLastSolveTime(0)
    setLastMoveCount(0)
    const scrambleAlg = await generateScramble()
    setScramble(scrambleAlg)
    setIsScrambling(false)
  }, [setScramble, timer, clearHistory])

  const handleRepeatScramble = useCallback(() => {
    if (!lastScramble) return
    timer.reset()
    clearHistory()
    setLastAnalysis(null)
    setLastSolveTime(0)
    setLastMoveCount(0)
    setScramble(lastScramble)
  }, [lastScramble, setScramble, timer, clearHistory])

  useEffect(() => {
    handleNewScramble()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSyncCube = useCallback(async () => {
    await resetCubeState()
    resetCubeFaces()
    cubeRef.current?.reset()
    const { createSolvedState } = await import('@/lib/cube-state')
    const solved = await createSolvedState()
    setFrozenPattern(solved.pattern)
    setIsCalibrationOpen(false)
  }, [resetCubeState, resetCubeFaces])

  const handleRecalibrateGyro = useCallback(() => {
    resetGyro()
    setIsCalibrationOpen(false)
  }, [resetGyro])

  useEffect(() => {
    calibrationActionsRef.current = {
      resetGyro,
      syncCube: handleSyncCube,
    }
  }, [resetGyro, handleSyncCube])

  useEffect(() => {
    if (isConnected && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      resetGyro()
      handleSyncCube()
    }
    if (!isConnected) {
      hasInitializedRef.current = false
    }
  }, [isConnected, resetGyro, handleSyncCube])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
        resetGyro()
      } else if (e.key === 'F4') {
        e.preventDefault()
        handleSyncCube()
      } else if ((e.ctrlKey && e.key === 'k') || e.key === 'Escape') {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      } else if (e.shiftKey && e.key === 'Enter' && !isConnected) {
        e.preventDefault()
        connect()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resetGyro, handleSyncCube, isConnected, connect])

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
    if (error || isMacAddressRequired) clearError()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="flex h-full w-full max-w-7xl flex-col">
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

        <CubeInfoModal
          isOpen={isCubeInfoOpen}
          onClose={() => setIsCubeInfoOpen(false)}
          batteryLevel={batteryLevel}
          onResetGyro={resetGyro}
          onSyncCube={handleSyncCube}
        />

        <Header
          onNavigate={setActiveTab}
          isConnected={isConnected}
          isConnecting={isConnecting}
          onConnect={connect}
          onDisconnect={disconnect}
          batteryLevel={batteryLevel}
        onCalibrate={() => setIsCalibrationOpen(true)}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {activeTab === 'timer' ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
            <StatusBar 
              solves={solves} 
              batteryLevel={batteryLevel} 
              isConnected={isConnected}
              isConnecting={isConnecting}
              onConnect={connect}
              onOpenCubeInfo={() => setIsCubeInfoOpen(true)}
            />
            {timer.status === 'stopped' && lastSolveTime > 0 ? (
              <SolveResults
                time={lastSolveTime}
                moves={lastMoveCount}
                analysis={lastAnalysis}
                onNextScramble={handleNewScramble}
                onRepeatScramble={handleRepeatScramble}
                onViewStats={() => {
                  if (solves.length > 0) {
                    setSelectedSolve(solves[0])
                    setSolveViewMode('stats')
                    setActiveTab('solves')
                  }
                }}
                pattern={frozenPattern}
                quaternionRef={quaternionRef}
                cubeRef={cubeRef}
                solve={solves.length > 0 ? solves[0] : undefined}
              />
            ) : (
              <>
                <ScrambleNotation
                  trackerState={scrambleState}
                  timerStatus={timer.status}
                  time={timer.time}
                />

                <div className="relative aspect-square w-full max-w-sm">
                  {!isLoading && (
                    <CubeViewer
                      pattern={frozenPattern}
                      quaternionRef={quaternionRef}
                      cubeRef={cubeRef}
                      config={DEFAULT_CONFIG}
                      animationSpeed={settings.animationSpeed}
                      cubeColors={cubeColors}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        ) : activeTab === 'solves' ? (
          solveViewMode === 'stats' && selectedSolve ? (
            <SolveDetailPage
              solve={selectedSolve}
              initialTab="stats"
              onBack={() => {
                setSolveViewMode('results')
              }}
            />
          ) : solveViewMode === 'replay' && selectedSolve ? (
            <SolveDetailPage
              solve={selectedSolve}
              initialTab="replay"
              onBack={() => {
                setSolveViewMode('results')
              }}
            />
          ) : solveViewMode === 'results' && selectedSolve ? (
            <SolveResults
              time={selectedSolve.time}
              moves={selectedSolve.solution.length}
              analysis={selectedSolve.cfopAnalysis || null}
              scramble={selectedSolve.scramble}
              showBackButton
              onBack={() => {
                setSelectedSolve(null)
                setSolveViewMode('list')
              }}
              onRepeatScramble={() => {
                setScramble(selectedSolve.scramble)
                setSelectedSolve(null)
                setSolveViewMode('list')
                setActiveTab('timer')
              }}
              onViewStats={() => setSolveViewMode('stats')}
              solve={selectedSolve}
            />
          ) : (
            <div className="flex-1 overflow-auto">
              <div className="p-4">
                <h2 className="mb-4 text-lg font-medium" style={{ color: 'var(--theme-text)' }}>Solve History</h2>
                <SolvesList 
                  solves={solves} 
                  onDelete={deleteSolve} 
                  onViewDetails={(solve) => {
                    setSelectedSolve(solve)
                    setSolveViewMode('results')
                  }}
                />
              </div>
            </div>
          )
        ) : activeTab === 'simulator' ? (
          <Simulator />
        ) : (
          <SettingsPanel />
        )}
      </main>

        <KeyboardHints isConnected={isConnected} />
        <Footer />

        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onResetGyro={() => {
            resetGyro()
          }}
          onResetCube={handleSyncCube}
          onConnectCube={() => {
            if (isConnected) {
              disconnect()
            } else {
              connect()
            }
          }}
          onNavigate={setActiveTab}
          isConnected={isConnected}
        />
      </div>
    </div>
  )
}

export default App
