import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, ArrowLeft, Box, Grid3X3 } from 'lucide-react'
import * as THREE from 'three'
import { CubeViewer, type RubiksCubeRef } from '@/components/cube'
import { CubeNet } from './cube-net'
import { DEFAULT_CONFIG } from '@/config/scene-config'
import {
  createSolvedCube,
  applyMove,
  cloneCube,
  cubeFacesToFacelets,
  type CubeFaces,
} from '@/lib/cube-faces'
import { analyzeCFOP, type CFOPPhase } from '@/lib/cfop-analyzer'
import { CROSS_COLOR_MAP, PHASE_COLORS } from '@/lib/constants'
import { formatTime } from '@/lib/format'
import type { Solve } from '@/types'

interface SolveResultsReplayProps {
  solve: Solve
  onBack?: () => void
}

interface PhaseMarker {
  name: string
  startIndex: number
  endIndex: number
  color: string
  startPercent: number
  widthPercent: number
}

function parseAlgorithm(alg: string): string[] {
  return alg
    .trim()
    .split(/\s+/)
    .filter((m) => m.length > 0)
}

type ViewMode = '3d' | '2d'

export function SolveResultsReplay({ solve, onBack }: SolveResultsReplayProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(500)
  const [viewMode, setViewMode] = useState<ViewMode>('3d')

  const hasGyroData = Boolean(solve.gyroData && solve.gyroData.length > 0)
  const hasMoveTimings = Boolean(solve.moveTimings && solve.moveTimings.length > 0)
  const [enableGyro, setEnableGyro] = useState(hasGyroData)

  const cubeRef = useRef<RubiksCubeRef>(null)
  const quaternionRef = useRef<THREE.Quaternion>(new THREE.Quaternion())
  const playbackStartTimeRef = useRef<number>(0)
  const currentMoveIndexRef = useRef<number>(-1)
  const isPlayingRef = useRef<boolean>(false)
  const animationFrameRef = useRef<number | null>(null)
  const lastRenderedIndexRef = useRef<number>(-1)

  const { states, analysis, phases, allMoves, totalMoves } = useMemo(() => {
    const scrambleMoves = parseAlgorithm(solve.scramble)

    let solutionMoves = solve.solution
    if (solve.cfopAnalysis) {
      const analysisMovesCount =
        solve.cfopAnalysis.cross.moves.length +
        solve.cfopAnalysis.f2l.reduce((sum: number, slot: CFOPPhase) => sum + slot.moves.length, 0) +
        solve.cfopAnalysis.oll.moves.length +
        solve.cfopAnalysis.pll.moves.length

      if (analysisMovesCount > solutionMoves.length) {
        solutionMoves = [
          ...solve.cfopAnalysis.cross.moves,
          ...solve.cfopAnalysis.f2l.flatMap((slot: CFOPPhase) => slot.moves),
          ...solve.cfopAnalysis.oll.moves,
          ...solve.cfopAnalysis.pll.moves,
        ]
      }
    }

    let cube = createSolvedCube()
    for (const move of scrambleMoves) {
      cube = applyMove(cube, move)
    }

    const stateHistory: CubeFaces[] = [cloneCube(cube)]
    for (const move of solutionMoves) {
      cube = applyMove(cube, move)
      stateHistory.push(cloneCube(cube))
    }

    const cfopAnalysis = solve.cfopAnalysis || analyzeCFOP(solutionMoves, stateHistory)
    const moveCount = solutionMoves.length

    const phaseMarkers: PhaseMarker[] = []
    if (cfopAnalysis && moveCount > 0) {
      let currentIndex = 0

      if (cfopAnalysis.cross.moves.length > 0) {
        const startPercent = (currentIndex / moveCount) * 100
        const widthPercent = (cfopAnalysis.cross.moves.length / moveCount) * 100
        phaseMarkers.push({
          name: 'Cross',
          startIndex: currentIndex,
          endIndex: currentIndex + cfopAnalysis.cross.moves.length - 1,
          color: PHASE_COLORS.cross,
          startPercent,
          widthPercent,
        })
        currentIndex += cfopAnalysis.cross.moves.length
      }

      const f2lColors = [PHASE_COLORS.f2l1, PHASE_COLORS.f2l2, PHASE_COLORS.f2l3, PHASE_COLORS.f2l4]
      cfopAnalysis.f2l.forEach((slot: CFOPPhase, i: number) => {
        if (slot.moves.length > 0) {
          const startPercent = (currentIndex / moveCount) * 100
          const widthPercent = (slot.moves.length / moveCount) * 100
          phaseMarkers.push({
            name: `F2L ${i + 1}`,
            startIndex: currentIndex,
            endIndex: currentIndex + slot.moves.length - 1,
            color: f2lColors[i],
            startPercent,
            widthPercent,
          })
          currentIndex += slot.moves.length
        }
      })

      if (cfopAnalysis.oll.moves.length > 0) {
        const startPercent = (currentIndex / moveCount) * 100
        const widthPercent = (cfopAnalysis.oll.moves.length / moveCount) * 100
        phaseMarkers.push({
          name: 'OLL',
          startIndex: currentIndex,
          endIndex: currentIndex + cfopAnalysis.oll.moves.length - 1,
          color: PHASE_COLORS.oll,
          startPercent,
          widthPercent,
        })
        currentIndex += cfopAnalysis.oll.moves.length
      }

      if (cfopAnalysis.pll.moves.length > 0) {
        const startPercent = (currentIndex / moveCount) * 100
        const widthPercent = (cfopAnalysis.pll.moves.length / moveCount) * 100
        phaseMarkers.push({
          name: 'PLL',
          startIndex: currentIndex,
          endIndex: currentIndex + cfopAnalysis.pll.moves.length - 1,
          color: PHASE_COLORS.pll,
          startPercent,
          widthPercent,
        })
      }
    }

    return {
      states: stateHistory,
      analysis: cfopAnalysis,
      phases: phaseMarkers,
      allMoves: solutionMoves,
      totalMoves: solutionMoves.length,
    }
  }, [solve.scramble, solve.solution, solve.cfopAnalysis])

  const currentState = states[currentMoveIndex + 1] || states[0]
  const currentFacelets = useMemo(() => cubeFacesToFacelets(currentState), [currentState])
  const tps = solve.time > 0 ? (allMoves.length / (solve.time / 1000)).toFixed(2) : '0.00'

  useEffect(() => {
    currentMoveIndexRef.current = currentMoveIndex
  }, [currentMoveIndex])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    playbackStartTimeRef.current = performance.now()
    const startMoveIndex = currentMoveIndexRef.current

    if (hasMoveTimings && solve.moveTimings && solve.moveTimings.length > 0) {
      const firstMoveTime = solve.moveTimings[0]?.time || 0
      const startTime =
        startMoveIndex >= 0 && startMoveIndex < solve.moveTimings.length
          ? solve.moveTimings[startMoveIndex].time
          : firstMoveTime
      const speedMultiplier = 500 / playbackSpeed

      const animate = () => {
        if (!isPlayingRef.current) return

        const elapsed = (performance.now() - playbackStartTimeRef.current) * speedMultiplier + startTime

        if (enableGyro && hasGyroData && solve.gyroData) {
          const gyroFrame = solve.gyroData.find((f, i) => {
            const next = solve.gyroData![i + 1]
            return !next || (elapsed >= f.time && elapsed < next.time)
          })
          if (gyroFrame) {
            quaternionRef.current.set(
              gyroFrame.quaternion.x,
              gyroFrame.quaternion.y,
              gyroFrame.quaternion.z,
              gyroFrame.quaternion.w,
            )
          }
        }

        let targetMoveIdx = -1
        for (let i = 0; i < solve.moveTimings!.length; i++) {
          if (solve.moveTimings![i].time <= elapsed) {
            targetMoveIdx = i
          } else {
            break
          }
        }

        if (targetMoveIdx !== currentMoveIndexRef.current && targetMoveIdx >= 0) {
          const prevIdx = currentMoveIndexRef.current
          currentMoveIndexRef.current = targetMoveIdx
          setCurrentMoveIndex(targetMoveIdx)

          if (viewMode === '3d' && cubeRef.current && targetMoveIdx > prevIdx) {
            for (let i = prevIdx + 1; i <= targetMoveIdx; i++) {
              if (i >= 0 && i < allMoves.length) {
                cubeRef.current.performMove(allMoves[i])
              }
            }
          }
        }

        if (targetMoveIdx >= totalMoves - 1) {
          setIsPlaying(false)
          return
        }

        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      const interval = setInterval(() => {
        const prev = currentMoveIndexRef.current
        if (prev >= totalMoves - 1) {
          setIsPlaying(false)
          return
        }
        const next = prev + 1
        currentMoveIndexRef.current = next
        setCurrentMoveIndex(next)

        if (viewMode === '3d' && cubeRef.current && next >= 0 && next < allMoves.length) {
          cubeRef.current.performMove(allMoves[next])
        }
      }, playbackSpeed)

      return () => clearInterval(interval)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [
    isPlaying,
    totalMoves,
    playbackSpeed,
    hasMoveTimings,
    hasGyroData,
    enableGyro,
    solve.moveTimings,
    solve.gyroData,
    viewMode,
    allMoves,
  ])

  const handleSeek = useCallback(
    (index: number) => {
      const newIndex = Math.max(-1, Math.min(index, totalMoves - 1))
      currentMoveIndexRef.current = newIndex
      setCurrentMoveIndex(newIndex)
    },
    [totalMoves],
  )

  const togglePlay = () => {
    if (!isPlaying) {
      playbackStartTimeRef.current = performance.now()
      lastRenderedIndexRef.current = currentMoveIndex
    }
    setIsPlaying(!isPlaying)
  }

  const stepBack = () => handleSeek(currentMoveIndex - 1)
  const stepForward = () => {
    const next = currentMoveIndex + 1
    handleSeek(next)
    if (viewMode === '3d' && cubeRef.current && next >= 0 && next < allMoves.length) {
      cubeRef.current.performMove(allMoves[next])
    }
  }
  const reset = () => {
    currentMoveIndexRef.current = -1
    lastRenderedIndexRef.current = -1
    setCurrentMoveIndex(-1)
    setIsPlaying(false)
  }

  const getCurrentPhase = () => {
    if (currentMoveIndex < 0) return null
    return phases.find((p) => currentMoveIndex >= p.startIndex && currentMoveIndex <= p.endIndex)
  }

  const currentPhase = getCurrentPhase()
  const progressPercent = totalMoves > 0 ? ((currentMoveIndex + 1) / totalMoves) * 100 : 0

  return (
    <div className="flex h-full w-full flex-col">
      {onBack && (
        <div
          className="flex items-center gap-4 px-6 py-4"
          style={{ borderBottom: '1px solid var(--theme-subAlt)' }}
        >
          <button
            onClick={onBack}
            className="rounded-lg p-2 transition-colors hover:opacity-80"
            style={{ color: 'var(--theme-sub)' }}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm" style={{ color: 'var(--theme-sub)' }}>
            Back to Results
          </span>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-1 flex-col items-center justify-center gap-6 px-4"
      >
        <div className="flex w-full max-w-4xl items-start justify-center gap-8">
          <div className="flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-base" style={{ color: 'var(--theme-sub)' }}>
                time
              </span>
              <div
                className="text-6xl font-bold tabular-nums"
                style={{ color: 'var(--theme-accent)' }}
              >
                {formatTime(solve.time)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-base" style={{ color: 'var(--theme-sub)' }}>
                tps
              </span>
              <div
                className="text-4xl font-bold tabular-nums"
                style={{ color: 'var(--theme-text)' }}
              >
                {tps}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative flex flex-col items-center gap-2"
          >
            <div
              className="flex gap-1 rounded-lg p-1"
              style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
            >
              <button
                onClick={() => setViewMode('3d')}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: viewMode === '3d' ? 'var(--theme-subAlt)' : 'transparent',
                  color: viewMode === '3d' ? 'var(--theme-text)' : 'var(--theme-sub)',
                }}
              >
                <Box className="h-3 w-3" />
                3D
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: viewMode === '2d' ? 'var(--theme-subAlt)' : 'transparent',
                  color: viewMode === '2d' ? 'var(--theme-text)' : 'var(--theme-sub)',
                }}
              >
                <Grid3X3 className="h-3 w-3" />
                2D
              </button>
            </div>

            <div
              className="flex h-56 w-56 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
            >
              {viewMode === '3d' ? (
                <CubeViewer
                  facelets={currentFacelets}
                  quaternionRef={enableGyro && hasGyroData ? quaternionRef : undefined}
                  cubeRef={cubeRef}
                  config={{
                    ...DEFAULT_CONFIG,
                    camera: {
                      ...DEFAULT_CONFIG.camera,
                      fov: 26,
                    },
                  }}
                  animationSpeed={30}
                />
              ) : (
                <CubeNet faces={currentState} size="md" />
              )}
            </div>

            {hasGyroData && (
              <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--theme-sub)' }}>
                <input
                  type="checkbox"
                  checked={enableGyro}
                  onChange={(e) => setEnableGyro(e.target.checked)}
                  className="h-3 w-3 rounded"
                  style={{ accentColor: 'var(--theme-accent)' }}
                />
                Gyroscope
              </label>
            )}
          </motion.div>

          {analysis && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-4"
              style={{ minWidth: '200px' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full border-2 border-white/30"
                  style={{ backgroundColor: CROSS_COLOR_MAP[analysis.crossColor].color }}
                />
                <span className="text-sm" style={{ color: 'var(--theme-text)' }}>
                  {CROSS_COLOR_MAP[analysis.crossColor].name} Cross
                </span>
              </div>

              {currentPhase && (
                <div
                  className="rounded-lg px-3 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: currentPhase.color + '40',
                    color: 'var(--theme-text)',
                  }}
                >
                  {currentPhase.name}
                </div>
              )}

              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
              >
                <div className="text-xs" style={{ color: 'var(--theme-sub)' }}>
                  {currentMoveIndex < 0
                    ? 'Scrambled'
                    : currentMoveIndex >= totalMoves - 1
                      ? 'Solved'
                      : `Move ${currentMoveIndex + 1} of ${totalMoves}`}
                </div>
                <div className="mt-1 font-mono text-lg" style={{ color: 'var(--theme-text)' }}>
                  {currentMoveIndex >= 0 && currentMoveIndex < totalMoves
                    ? allMoves[currentMoveIndex]
                    : '—'}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex w-full max-w-3xl flex-col gap-3"
        >
          <div className="relative flex h-3 w-full items-center gap-1">
            {phases.map((phase, index) => {
              const isFirst = index === 0
              const isLast = index === phases.length - 1
              return (
                <div
                  key={phase.name}
                  className="relative h-full cursor-pointer transition-opacity hover:opacity-80"
                  style={{
                    width: `${phase.widthPercent}%`,
                    backgroundColor: phase.color,
                    borderRadius: isFirst && isLast
                      ? '9999px'
                      : isFirst
                        ? '9999px 0 0 9999px'
                        : isLast
                          ? '0 9999px 9999px 0'
                          : '0',
                  }}
                  onClick={() => handleSeek(phase.startIndex)}
                  title={phase.name}
                />
              )
            })}

            <div
              className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-white shadow-lg transition-all"
              style={{
                left: `${progressPercent}%`,
                transform: `translateX(-50%) translateY(-50%)`,
              }}
            />

            <input
              type="range"
              min={-1}
              max={totalMoves - 1}
              value={currentMoveIndex}
              onChange={(e) => handleSeek(parseInt(e.target.value))}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {phases.map((phase) => (
              <button
                key={phase.name}
                onClick={() => handleSeek(phase.startIndex)}
                className="rounded-full px-2 py-0.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: phase.color }}
              >
                {phase.name}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={reset}
            className="rounded-lg p-3 transition-colors hover:opacity-80"
            style={{ color: 'var(--theme-sub)' }}
            title="Reset"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={stepBack}
            disabled={currentMoveIndex < 0}
            className="rounded-lg p-3 transition-colors disabled:opacity-30"
            style={{ color: 'var(--theme-sub)' }}
            title="Step Back"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={togglePlay}
            className="rounded-full p-4 transition-colors"
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-bg)',
            }}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          <button
            onClick={stepForward}
            disabled={currentMoveIndex >= totalMoves - 1}
            className="rounded-lg p-3 transition-colors disabled:opacity-30"
            style={{ color: 'var(--theme-sub)' }}
            title="Step Forward"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
            className="rounded-lg border-0 px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: 'var(--theme-bgSecondary)',
              color: 'var(--theme-text)',
            }}
          >
            <option value={1000}>0.5x</option>
            <option value={500}>1x</option>
            <option value={250}>2x</option>
            <option value={100}>5x</option>
          </select>
        </motion.div>
      </motion.div>
    </div>
  )
}
