import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Box, Grid3X3 } from 'lucide-react'
import * as THREE from 'three'
import { CubeNet } from './cube-net'
import { CubeViewer, type RubiksCubeRef } from './cube'
import {
  createSolvedCube,
  applyMove,
  cloneCube,
  cubeFacesToFacelets,
  type CubeFaces,
} from '@/lib/cube-faces'
import { analyzeCFOP, type CFOPPhase } from '@/lib/cfop-analyzer'
import { CROSS_COLOR_MAP, PHASE_COLORS } from '@/lib/constants'
import type { Solve } from '@/types'

interface SolveReplayContentProps {
  solve: Solve
}

interface PhaseMarker {
  name: string
  startIndex: number
  endIndex: number
  color: string
}

function parseAlgorithm(alg: string): string[] {
  return alg
    .trim()
    .split(/\s+/)
    .filter((m) => m.length > 0)
}

type ViewMode = '3d' | '2d'

export function SolveReplayContent({ solve }: SolveReplayContentProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(500)
  const [viewMode, setViewMode] = useState<ViewMode>('3d')
  const [enableGyro, setEnableGyro] = useState(false)

  const cubeRef = useRef<RubiksCubeRef>(null)
  const quaternionRef = useRef<THREE.Quaternion>(new THREE.Quaternion())
  const playbackStartTimeRef = useRef<number>(0)
  const currentMoveIndexRef = useRef<number>(-1)
  const isPlayingRef = useRef<boolean>(false)
  const animationFrameRef = useRef<number | null>(null)
  const lastRenderedIndexRef = useRef<number>(-1)

  const hasGyroData = Boolean(solve.gyroData && solve.gyroData.length > 0)
  const hasMoveTimings = Boolean(solve.moveTimings && solve.moveTimings.length > 0)

  const { states, analysis, phases, allMoves } = useMemo(() => {
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

    const phaseMarkers: PhaseMarker[] = []
    if (cfopAnalysis) {
      let currentIndex = 0

      if (cfopAnalysis.cross.moves.length > 0) {
        phaseMarkers.push({
          name: 'Cross',
          startIndex: currentIndex,
          endIndex: currentIndex + cfopAnalysis.cross.moves.length - 1,
          color: PHASE_COLORS.cross,
        })
        currentIndex += cfopAnalysis.cross.moves.length
      }

      const f2lColors = [PHASE_COLORS.f2l1, PHASE_COLORS.f2l2, PHASE_COLORS.f2l3, PHASE_COLORS.f2l4]
      cfopAnalysis.f2l.forEach((slot: CFOPPhase, i: number) => {
        if (slot.moves.length > 0) {
          phaseMarkers.push({
            name: `F2L ${i + 1}`,
            startIndex: currentIndex,
            endIndex: currentIndex + slot.moves.length - 1,
            color: f2lColors[i],
          })
          currentIndex += slot.moves.length
        }
      })

      if (cfopAnalysis.oll.moves.length > 0) {
        phaseMarkers.push({
          name: 'OLL',
          startIndex: currentIndex,
          endIndex: currentIndex + cfopAnalysis.oll.moves.length - 1,
          color: PHASE_COLORS.oll,
        })
        currentIndex += cfopAnalysis.oll.moves.length
      }

      if (cfopAnalysis.pll.moves.length > 0) {
        phaseMarkers.push({
          name: 'PLL',
          startIndex: currentIndex,
          endIndex: currentIndex + cfopAnalysis.pll.moves.length - 1,
          color: PHASE_COLORS.pll,
        })
      }
    }

    return { states: stateHistory, analysis: cfopAnalysis, phases: phaseMarkers, allMoves: solutionMoves }
  }, [solve.scramble, solve.solution, solve.cfopAnalysis])

  const currentState = states[currentMoveIndex + 1] || states[0]
  const currentFacelets = useMemo(() => cubeFacesToFacelets(currentState), [currentState])
  const totalMoves = allMoves.length

  const displayFacelets = useMemo(() => {
    if (isPlaying) {
      const frozenState = states[lastRenderedIndexRef.current + 1] || states[0]
      return cubeFacesToFacelets(frozenState)
    }
    lastRenderedIndexRef.current = currentMoveIndex
    return currentFacelets
  }, [isPlaying, currentFacelets, states, currentMoveIndex])

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

  const stepBack = () => {
    handleSeek(currentMoveIndex - 1)
  }

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

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start gap-6">
        <div className="flex flex-col gap-3">
          <div 
            className="flex gap-1 rounded-lg p-1"
            style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
          >
            <button
              onClick={() => setViewMode('3d')}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: viewMode === '3d' ? 'var(--theme-subAlt)' : 'transparent',
                color: viewMode === '3d' ? 'var(--theme-text)' : 'var(--theme-sub)',
              }}
            >
              <Box className="h-4 w-4" />
              3D Render
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: viewMode === '2d' ? 'var(--theme-subAlt)' : 'transparent',
                color: viewMode === '2d' ? 'var(--theme-text)' : 'var(--theme-sub)',
              }}
            >
              <Grid3X3 className="h-4 w-4" />
              2D Mapping
            </button>
          </div>

          <div 
            className="h-64 w-64 flex-shrink-0 rounded-lg"
            style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
          >
            {viewMode === '3d' ? (
              <CubeViewer
                facelets={displayFacelets}
                quaternionRef={enableGyro && hasGyroData ? quaternionRef : undefined}
                cubeRef={cubeRef}
                animationSpeed={30}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <CubeNet faces={currentState} size="md" />
              </div>
            )}
          </div>

          {hasGyroData && (
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-sub)' }}>
              <input
                type="checkbox"
                checked={enableGyro}
                onChange={(e) => setEnableGyro(e.target.checked)}
                className="h-4 w-4 rounded"
                style={{ accentColor: 'var(--theme-accent)' }}
              />
              Enable Gyroscope Playback
            </label>
          )}
        </div>

        <div className="flex-1">
          {analysis && (
            <div 
              className="mb-4 flex items-center gap-3 rounded-lg p-3"
              style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
            >
              <div
                className="h-5 w-5 rounded-full border-2 border-white/30"
                style={{ backgroundColor: CROSS_COLOR_MAP[analysis.crossColor].color }}
              />
              <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
                Cross: {CROSS_COLOR_MAP[analysis.crossColor].name}
              </span>
            </div>
          )}

          {currentPhase && (
            <div
              className="mb-4 rounded-lg px-3 py-2 text-sm font-medium"
              style={{ 
                backgroundColor: currentPhase.color + '40',
                color: 'var(--theme-text)'
              }}
            >
              Current Phase: {currentPhase.name}
            </div>
          )}

          <div 
            className="rounded-lg p-3"
            style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
          >
            <div className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-sub)' }}>
              {currentMoveIndex < 0
                ? 'Scrambled State'
                : currentMoveIndex >= totalMoves - 1
                  ? 'Solved!'
                  : currentPhase
                    ? `Move ${currentMoveIndex - currentPhase.startIndex + 1} of ${currentPhase.endIndex - currentPhase.startIndex + 1}`
                    : `Move ${currentMoveIndex + 1} of ${totalMoves}`}
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono text-base">
              {currentPhase ? (
                allMoves.slice(currentPhase.startIndex, currentPhase.endIndex + 1).map((move, i) => {
                  const globalIndex = currentPhase.startIndex + i
                  const isCompleted = globalIndex < currentMoveIndex
                  const isCurrent = globalIndex === currentMoveIndex
                  const isQueued = globalIndex > currentMoveIndex
                  return (
                    <button
                      key={globalIndex}
                      onClick={() => handleSeek(globalIndex)}
                      className="rounded px-1.5 py-0.5 transition-all"
                      style={{
                        backgroundColor: isCurrent ? 'var(--theme-subAlt)' : 'transparent',
                        color: isQueued ? 'var(--theme-sub)' : 'var(--theme-text)',
                        fontWeight: isCurrent || isCompleted ? 'bold' : 'normal',
                      }}
                    >
                      {move}
                    </button>
                  )
                })
              ) : currentMoveIndex >= 0 && currentMoveIndex < totalMoves ? (
                <span style={{ color: 'var(--theme-text)' }}>{allMoves[currentMoveIndex]}</span>
              ) : (
                <span style={{ color: 'var(--theme-sub)' }}>—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div 
          className="relative h-8 rounded-lg"
          style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
        >
          {phases.map((phase) => {
            const startPercent = (phase.startIndex / totalMoves) * 100
            const widthPercent = ((phase.endIndex - phase.startIndex + 1) / totalMoves) * 100
            return (
              <div
                key={phase.name}
                className="absolute top-0 h-full cursor-pointer transition-opacity hover:opacity-80"
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  backgroundColor: phase.color,
                }}
                onClick={() => handleSeek(phase.startIndex)}
                title={phase.name}
              />
            )
          })}

          <div
            className="absolute top-0 h-full w-1 bg-white shadow-lg"
            style={{
              left: `${((currentMoveIndex + 1) / totalMoves) * 100}%`,
              transform: 'translateX(-50%)',
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

        <div className="flex flex-wrap gap-2">
          {phases.map((phase) => (
            <button
              key={phase.name}
              onClick={() => handleSeek(phase.startIndex)}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: phase.color }}
            >
              {phase.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="rounded-lg p-3 transition-colors"
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
            color: 'var(--theme-bg)' 
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
          className="rounded-lg px-3 py-2 text-sm"
          style={{ 
            backgroundColor: 'var(--theme-bgSecondary)', 
            color: 'var(--theme-text)' 
          }}
        >
          <option value={1000}>0.5x</option>
          <option value={500}>1x</option>
          <option value={250}>2x</option>
          <option value={100}>5x</option>
        </select>
      </div>

      {analysis && (
        <div 
          className="space-y-2 rounded-lg p-4"
          style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
        >
          <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--theme-text)' }}>CFOP Breakdown</h3>
          <PhaseRow
            name="Cross"
            moves={analysis.cross.moves}
            skipped={analysis.cross.skipped}
            color={PHASE_COLORS.cross}
          />
          {analysis.f2l.map((slot: CFOPPhase, i: number) => (
            <PhaseRow
              key={i}
              name={`F2L ${i + 1}`}
              moves={slot.moves}
              skipped={slot.skipped}
              color={[PHASE_COLORS.f2l1, PHASE_COLORS.f2l2, PHASE_COLORS.f2l3, PHASE_COLORS.f2l4][i]}
            />
          ))}
          <PhaseRow name="OLL" moves={analysis.oll.moves} skipped={analysis.oll.skipped} color={PHASE_COLORS.oll} />
          <PhaseRow name="PLL" moves={analysis.pll.moves} skipped={analysis.pll.skipped} color={PHASE_COLORS.pll} />
        </div>
      )}
    </div>
  )
}

function PhaseRow({
  name,
  moves,
  skipped,
  color,
}: {
  name: string
  moves: string[]
  skipped: boolean
  color: string
}) {
  return (
    <div 
      className="flex items-start gap-3 rounded-lg p-2"
      style={{ backgroundColor: 'var(--theme-subAlt)' }}
    >
      <div className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>{name}</span>
          <span className="text-xs" style={{ color: 'var(--theme-sub)' }}>{skipped ? 0 : moves.length} moves</span>
        </div>
        <div className="font-mono text-xs" style={{ color: 'var(--theme-sub)' }}>
          {skipped ? <span className="italic">Skipped</span> : moves.join(' ') || '—'}
        </div>
      </div>
    </div>
  )
}
