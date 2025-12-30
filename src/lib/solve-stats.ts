import type { Solve, MoveFrame } from '@/types'
import type { CFOPPhase } from '@/lib/cfop-analyzer'

export interface PhaseStats {
  name: string
  moves: string[]
  moveCount: number
  duration: number
  tps: number
  recognitionTime: number
  executionTime: number
  startTime: number
  endTime: number
}

export interface TPSDataPoint {
  time: number
  tps: number
  phase: string
}

export interface SolveStats {
  totalTime: number
  totalMoves: number
  globalTPS: number
  phases: PhaseStats[]
  tpsOverTime: TPSDataPoint[]
  rotationCount: number
  pauseTime: number
  executionTime: number
  splits: {
    cross: number
    f2l: number
    oll: number
    pll: number
  }
  idealSplits: {
    cross: number
    f2l: number
    oll: number
    pll: number
  }
}

const PAUSE_THRESHOLD = 500
const EXECUTION_THRESHOLD = 300
const TPS_WINDOW = 1000

function isRotation(move: string): boolean {
  const base = move.replace(/['2]/g, '')
  return ['x', 'y', 'z'].includes(base.toLowerCase())
}

function calculateInstantTPS(
  moveTimings: MoveFrame[],
  windowMs: number = TPS_WINDOW,
): TPSDataPoint[] {
  if (moveTimings.length < 2) return []

  const points: TPSDataPoint[] = []
  const totalDuration = moveTimings[moveTimings.length - 1].time

  for (let t = 0; t <= totalDuration; t += 100) {
    const windowStart = Math.max(0, t - windowMs / 2)
    const windowEnd = t + windowMs / 2

    const movesInWindow = moveTimings.filter((m) => m.time >= windowStart && m.time <= windowEnd)
    const tps = movesInWindow.length / (windowMs / 1000)

    points.push({ time: t, tps, phase: '' })
  }

  return points
}

function calculatePhaseStats(
  phaseName: string,
  moves: string[],
  moveTimings: MoveFrame[],
  phaseStartIdx: number,
): PhaseStats {
  if (moves.length === 0) {
    return {
      name: phaseName,
      moves: [],
      moveCount: 0,
      duration: 0,
      tps: 0,
      recognitionTime: 0,
      executionTime: 0,
      startTime: 0,
      endTime: 0,
    }
  }

  const phaseEndIdx = phaseStartIdx + moves.length - 1
  const phaseMoveTimings = moveTimings.slice(phaseStartIdx, phaseEndIdx + 1)

  if (phaseMoveTimings.length === 0) {
    return {
      name: phaseName,
      moves,
      moveCount: moves.length,
      duration: 0,
      tps: 0,
      recognitionTime: 0,
      executionTime: 0,
      startTime: 0,
      endTime: 0,
    }
  }

  const startTime = phaseMoveTimings[0]?.time ?? 0
  const endTime = phaseMoveTimings[phaseMoveTimings.length - 1]?.time ?? 0
  const duration = endTime - startTime

  const prevMoveTime = phaseStartIdx > 0 ? (moveTimings[phaseStartIdx - 1]?.time ?? 0) : 0
  const recognitionTime = startTime - prevMoveTime

  let pauseTime = 0
  for (let i = 1; i < phaseMoveTimings.length; i++) {
    const gap = phaseMoveTimings[i].time - phaseMoveTimings[i - 1].time
    if (gap > PAUSE_THRESHOLD) {
      pauseTime += gap - EXECUTION_THRESHOLD
    }
  }
  const executionTime = duration - pauseTime

  const tps = duration > 0 ? moves.length / (duration / 1000) : 0

  return {
    name: phaseName,
    moves,
    moveCount: moves.length,
    duration,
    tps,
    recognitionTime: Math.max(0, recognitionTime),
    executionTime: Math.max(0, executionTime),
    startTime,
    endTime,
  }
}

export function calculateSolveStats(solve: Solve): SolveStats | null {
  if (!solve.cfopAnalysis || !solve.moveTimings || solve.moveTimings.length === 0) {
    return null
  }

  const analysis = solve.cfopAnalysis
  const moveTimings = solve.moveTimings
  const totalTime = solve.time

  const allMoves = [
    ...analysis.cross.moves,
    ...analysis.f2l.flatMap((s: CFOPPhase) => s.moves),
    ...analysis.oll.moves,
    ...analysis.pll.moves,
  ]

  const totalMoves = allMoves.length
  const globalTPS = totalMoves / (totalTime / 1000)

  const rotationCount = allMoves.filter(isRotation).length

  let currentIdx = 0
  const phases: PhaseStats[] = []

  const crossStats = calculatePhaseStats('Cross', analysis.cross.moves, moveTimings, currentIdx)
  phases.push(crossStats)
  currentIdx += analysis.cross.moves.length

  for (let i = 0; i < analysis.f2l.length; i++) {
    const slot = analysis.f2l[i]
    const slotStats = calculatePhaseStats(`F2L ${i + 1}`, slot.moves, moveTimings, currentIdx)
    phases.push(slotStats)
    currentIdx += slot.moves.length
  }

  const ollStats = calculatePhaseStats('OLL', analysis.oll.moves, moveTimings, currentIdx)
  phases.push(ollStats)
  currentIdx += analysis.oll.moves.length

  const pllStats = calculatePhaseStats('PLL', analysis.pll.moves, moveTimings, currentIdx)
  phases.push(pllStats)

  const crossTime = crossStats.duration + crossStats.recognitionTime
  const f2lTime = phases
    .filter((p) => p.name.startsWith('F2L'))
    .reduce((sum, p) => sum + p.duration + p.recognitionTime, 0)
  const ollTime = ollStats.duration + ollStats.recognitionTime
  const pllTime = pllStats.duration + pllStats.recognitionTime
  const totalPhaseTime = crossTime + f2lTime + ollTime + pllTime

  const splits = {
    cross: totalPhaseTime > 0 ? (crossTime / totalPhaseTime) * 100 : 0,
    f2l: totalPhaseTime > 0 ? (f2lTime / totalPhaseTime) * 100 : 0,
    oll: totalPhaseTime > 0 ? (ollTime / totalPhaseTime) * 100 : 0,
    pll: totalPhaseTime > 0 ? (pllTime / totalPhaseTime) * 100 : 0,
  }

  const idealSplits = {
    cross: 12,
    f2l: 50,
    oll: 13,
    pll: 25,
  }

  let pauseTime = 0
  for (let i = 1; i < moveTimings.length; i++) {
    const gap = moveTimings[i].time - moveTimings[i - 1].time
    if (gap > PAUSE_THRESHOLD) {
      pauseTime += gap
    }
  }
  const executionTime = totalTime - pauseTime

  const tpsOverTime = calculateInstantTPS(moveTimings)

  let phaseIdx = 0
  let moveInPhase = 0
  for (const point of tpsOverTime) {
    while (phaseIdx < phases.length && moveInPhase >= phases[phaseIdx].moveCount) {
      moveInPhase = 0
      phaseIdx++
    }
    if (phaseIdx < phases.length) {
      point.phase = phases[phaseIdx].name
    }
  }

  return {
    totalTime,
    totalMoves,
    globalTPS,
    phases,
    tpsOverTime,
    rotationCount,
    pauseTime,
    executionTime,
    splits,
    idealSplits,
  }
}

export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function formatTPS(tps: number): string {
  return tps.toFixed(2)
}
