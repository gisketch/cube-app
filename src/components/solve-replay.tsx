import { useState, useEffect, useCallback, useMemo } from 'react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { CubeNet } from './cube-net'
import { CubeViewer } from './cube'
import { createSolvedCube, applyMove, cloneCube, cubeFacesToFacelets, type CubeFaces } from '@/lib/cube-faces'
import { analyzeCFOP } from '@/lib/cfop-analyzer'
import type { Solve } from '@/hooks/useSolves'

interface SolveReplayProps {
  solve: Solve
  onClose: () => void
}

interface PhaseMarker {
  name: string
  startIndex: number
  endIndex: number
  color: string
}

const CROSS_COLOR_MAP: Record<string, { name: string; color: string }> = {
  W: { name: 'White', color: '#FFFFFF' },
  Y: { name: 'Yellow', color: '#FFEB3B' },
  G: { name: 'Green', color: '#4CAF50' },
  B: { name: 'Blue', color: '#2196F3' },
  R: { name: 'Red', color: '#F44336' },
  O: { name: 'Orange', color: '#FF9800' },
}

const PHASE_COLORS = {
  cross: '#3B82F6',
  f2l1: '#10B981',
  f2l2: '#14B8A6',
  f2l3: '#06B6D4',
  f2l4: '#0EA5E9',
  oll: '#F59E0B',
  pll: '#EF4444',
}

function parseAlgorithm(alg: string): string[] {
  return alg.trim().split(/\s+/).filter((m) => m.length > 0)
}

export function SolveReplay({ solve, onClose }: SolveReplayProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(500)
  const [showMapping, setShowMapping] = useState(false)

  const { states, analysis, phases, allMoves } = useMemo(() => {
    const scrambleMoves = parseAlgorithm(solve.scramble)
    
    let solutionMoves = solve.solution
    if (solve.cfopAnalysis) {
      const analysisMovesCount = 
        solve.cfopAnalysis.cross.moves.length +
        solve.cfopAnalysis.f2l.reduce((sum, slot) => sum + slot.moves.length, 0) +
        solve.cfopAnalysis.oll.moves.length +
        solve.cfopAnalysis.pll.moves.length
      
      if (analysisMovesCount > solutionMoves.length) {
        solutionMoves = [
          ...solve.cfopAnalysis.cross.moves,
          ...solve.cfopAnalysis.f2l.flatMap(slot => slot.moves),
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
      cfopAnalysis.f2l.forEach((slot, i) => {
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

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentMoveIndex((prev) => {
        if (prev >= totalMoves - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, playbackSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, totalMoves, playbackSpeed])

  const handleSeek = useCallback((index: number) => {
    setCurrentMoveIndex(Math.max(-1, Math.min(index, totalMoves - 1)))
  }, [totalMoves])

  const togglePlay = () => setIsPlaying(!isPlaying)
  const stepBack = () => handleSeek(currentMoveIndex - 1)
  const stepForward = () => handleSeek(currentMoveIndex + 1)
  const reset = () => {
    setCurrentMoveIndex(-1)
    setIsPlaying(false)
  }

  const getCurrentPhase = () => {
    if (currentMoveIndex < 0) return null
    return phases.find((p) => currentMoveIndex >= p.startIndex && currentMoveIndex <= p.endIndex)
  }

  const currentPhase = getCurrentPhase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-4 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-neutral-900">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Solve Replay</h2>
            <p className="text-sm text-neutral-400">
              {(solve.time / 1000).toFixed(2)}s • {totalMoves} moves
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-auto p-6">
          <div className="flex items-start gap-6">
            <div className="flex flex-col gap-3">
              <div className="h-64 w-64 flex-shrink-0 rounded-lg bg-neutral-800">
                <CubeViewer facelets={currentFacelets} />
              </div>
              
              <label className="flex items-center gap-2 text-sm text-neutral-400">
                <input
                  type="checkbox"
                  checked={showMapping}
                  onChange={(e) => setShowMapping(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-600 bg-neutral-700 text-blue-500 focus:ring-blue-500"
                />
                Show 2D Mapping
              </label>
              
              {showMapping && (
                <div className="flex-shrink-0">
                  <CubeNet faces={currentState} size="md" />
                </div>
              )}
            </div>

            <div className="flex-1">
              {analysis && (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-neutral-800 p-3">
                  <div
                    className="h-5 w-5 rounded-full border-2 border-white/30"
                    style={{ backgroundColor: CROSS_COLOR_MAP[analysis.crossColor].color }}
                  />
                  <span className="text-sm font-medium text-white">
                    Cross: {CROSS_COLOR_MAP[analysis.crossColor].name}
                  </span>
                </div>
              )}

              {currentPhase && (
                <div
                  className="mb-4 rounded-lg px-3 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: currentPhase.color + '40' }}
                >
                  Current Phase: {currentPhase.name}
                </div>
              )}

              <div className="rounded-lg bg-neutral-800 p-3">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  {currentMoveIndex < 0 
                    ? 'Scrambled State'
                    : currentMoveIndex >= totalMoves - 1 
                      ? 'Solved!'
                      : `Move ${currentMoveIndex + 1} of ${totalMoves}`
                  }
                </div>
                <div className="font-mono text-lg text-white">
                  {currentMoveIndex >= 0 && currentMoveIndex < totalMoves 
                    ? allMoves[currentMoveIndex] 
                    : '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative h-8 rounded-lg bg-neutral-800">
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
              className="rounded-lg p-3 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Reset"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              onClick={stepBack}
              disabled={currentMoveIndex < 0}
              className="rounded-lg p-3 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              title="Step Back"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={togglePlay}
              className="rounded-full bg-blue-500 p-4 text-white transition-colors hover:bg-blue-600"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            <button
              onClick={stepForward}
              disabled={currentMoveIndex >= totalMoves - 1}
              className="rounded-lg p-3 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              title="Step Forward"
            >
              <SkipForward className="h-4 w-4" />
            </button>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
              className="rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white"
            >
              <option value={1000}>0.5x</option>
              <option value={500}>1x</option>
              <option value={250}>2x</option>
              <option value={100}>5x</option>
            </select>
          </div>

          {analysis && (
            <div className="space-y-2 rounded-lg bg-neutral-800 p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">CFOP Breakdown</h3>
              <PhaseRow name="Cross" moves={analysis.cross.moves} skipped={analysis.cross.skipped} color={PHASE_COLORS.cross} />
              {analysis.f2l.map((slot, i) => (
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
      </div>
    </div>
  )
}

function PhaseRow({ name, moves, skipped, color }: { name: string; moves: string[]; skipped: boolean; color: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-neutral-700/30 p-2">
      <div className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-300">{name}</span>
          <span className="text-xs text-neutral-500">{skipped ? 0 : moves.length} moves</span>
        </div>
        <div className="font-mono text-xs text-neutral-400">
          {skipped ? <span className="italic text-neutral-500">Skipped</span> : moves.join(' ') || '—'}
        </div>
      </div>
    </div>
  )
}
