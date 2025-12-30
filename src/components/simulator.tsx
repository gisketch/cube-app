import { useState } from 'react'
import { Play } from 'lucide-react'
import { createSolvedCube, applyMove, type CubeFaces } from '@/lib/cube-faces'
import { analyzeCFOP, type CFOPAnalysis } from '@/lib/cfop-analyzer'

const CROSS_COLOR_MAP: Record<string, { name: string; color: string }> = {
  W: { name: 'White', color: '#FFFFFF' },
  Y: { name: 'Yellow', color: '#FFEB3B' },
  G: { name: 'Green', color: '#4CAF50' },
  B: { name: 'Blue', color: '#2196F3' },
  R: { name: 'Red', color: '#F44336' },
  O: { name: 'Orange', color: '#FF9800' },
}

function parseAlgorithm(alg: string): string[] {
  return alg
    .trim()
    .split(/\s+/)
    .filter((m) => m.length > 0)
}

function simulateSolve(scramble: string, solution: string): { analysis: CFOPAnalysis | null; error: string | null } {
  try {
    const scrambleMoves = parseAlgorithm(scramble)
    const solutionMoves = parseAlgorithm(solution)

    let cube = createSolvedCube()
    for (const move of scrambleMoves) {
      cube = applyMove(cube, move)
    }

    const stateHistory: CubeFaces[] = [{ ...cube, U: [...cube.U], D: [...cube.D], F: [...cube.F], B: [...cube.B], L: [...cube.L], R: [...cube.R] }]

    for (const move of solutionMoves) {
      cube = applyMove(cube, move)
      stateHistory.push({ ...cube, U: [...cube.U], D: [...cube.D], F: [...cube.F], B: [...cube.B], L: [...cube.L], R: [...cube.R] })
    }

    const analysis = analyzeCFOP(solutionMoves, stateHistory)
    return { analysis, error: null }
  } catch (e) {
    return { analysis: null, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export function Simulator() {
  const [scramble, setScramble] = useState('')
  const [solution, setSolution] = useState('')
  const [analysis, setAnalysis] = useState<CFOPAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSimulate = () => {
    const result = simulateSolve(scramble, solution)
    setAnalysis(result.analysis)
    setError(result.error)
  }

  const totalMoves = analysis
    ? analysis.cross.moves.length +
      analysis.f2l.reduce((sum, slot) => sum + slot.moves.length, 0) +
      analysis.oll.moves.length +
      analysis.pll.moves.length
    : 0

  return (
    <div className="flex h-full flex-col p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">CFOP Simulator</h2>

      <div className="mb-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">Scramble</label>
          <textarea
            value={scramble}
            onChange={(e) => setScramble(e.target.value)}
            placeholder="R U R' U' R' F R2 U' R' U' R U R' F'"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-white/30 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={2}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">Solution</label>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="D L D2 R' D' R D' L' ... (your solution moves)"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-white/30 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <button
          onClick={handleSimulate}
          disabled={!scramble.trim() || !solution.trim()}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          Simulate
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {analysis && (
        <div className="flex-1 overflow-auto rounded-lg bg-neutral-800 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">CFOP Analysis</h3>
            <span className="text-sm text-neutral-400">{totalMoves} total moves</span>
          </div>

          <div className="mb-4 flex items-center gap-3 rounded-lg bg-neutral-700/50 p-3">
            <div
              className="h-6 w-6 rounded-full border-2 border-white/30"
              style={{ backgroundColor: CROSS_COLOR_MAP[analysis.crossColor].color }}
            />
            <span className="font-medium text-white">
              Cross Color: {CROSS_COLOR_MAP[analysis.crossColor].name}
            </span>
          </div>

          <div className="space-y-3">
            <PhaseRow name="Cross" moves={analysis.cross.moves} skipped={analysis.cross.skipped} />
            {analysis.f2l.map((slot, i) => (
              <PhaseRow key={i} name={`F2L Slot ${i + 1}`} moves={slot.moves} skipped={slot.skipped} />
            ))}
            <PhaseRow name="OLL" moves={analysis.oll.moves} skipped={analysis.oll.skipped} />
            <PhaseRow name="PLL" moves={analysis.pll.moves} skipped={analysis.pll.skipped} />
          </div>
        </div>
      )}

      {!analysis && !error && (
        <div className="flex flex-1 items-center justify-center text-neutral-500">
          Enter a scramble and solution, then click Simulate to analyze.
        </div>
      )}
    </div>
  )
}

function PhaseRow({ name, moves, skipped }: { name: string; moves: string[]; skipped: boolean }) {
  return (
    <div className="rounded-lg bg-neutral-700/30 p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-300">{name}</span>
        <span className="text-xs text-neutral-500">{skipped ? 0 : moves.length} moves</span>
      </div>
      <div className="font-mono text-sm text-neutral-400">
        {skipped ? <span className="italic text-neutral-500">Skipped</span> : moves.join(' ') || '—'}
      </div>
    </div>
  )
}
