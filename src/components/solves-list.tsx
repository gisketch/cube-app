import { Trash2, ChevronDown, ChevronUp, Play } from 'lucide-react'
import { useState } from 'react'
import type { Solve } from '@/hooks/useSolves'
import { SolveReplay } from './solve-replay'

interface SolvesListProps {
  solves: Solve[]
  onDelete?: (id: string) => void
}

const CROSS_COLOR_MAP: Record<string, string> = {
  W: '#FFFFFF',
  Y: '#FFEB3B',
  G: '#4CAF50',
  B: '#2196F3',
  R: '#F44336',
  O: '#FF9800',
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const centiseconds = Math.floor((ms % 1000) / 10)

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }
  return `${seconds}.${centiseconds.toString().padStart(2, '0')}`
}

function SolveItem({
  solve,
  index,
  total,
  onDelete,
  onReplay,
}: {
  solve: Solve
  index: number
  total: number
  onDelete?: (id: string) => void
  onReplay?: (solve: Solve) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-lg bg-white/5 transition-colors hover:bg-white/10">
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <span className="w-8 text-sm text-white/40">#{total - index}</span>
          <span className="font-mono text-xl text-white">{formatTime(solve.time)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30">
            {new Date(solve.date).toLocaleDateString()}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-white/10 px-4 py-3">
          <div className="mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-white/40">Scramble</span>
            <p className="mt-1 font-mono text-sm text-white/70">{solve.scramble}</p>
          </div>
          {solve.solution.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                Solution ({solve.solution.length} moves)
              </span>
              <p className="mt-1 font-mono text-sm text-white/70">{solve.solution.join(' ')}</p>
            </div>
          )}
          {solve.cfopAnalysis && (
            <div className="mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                CFOP Breakdown
              </span>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full border border-white/30" 
                    style={{ backgroundColor: CROSS_COLOR_MAP[solve.cfopAnalysis.crossColor] }}
                  />
                  <span className="text-xs text-white/50 w-16">Cross</span>
                  <span className="font-mono text-xs text-white/70">
                    {solve.cfopAnalysis.cross.skipped ? 'Skipped' : solve.cfopAnalysis.cross.moves.join(' ')}
                  </span>
                </div>
                {solve.cfopAnalysis.f2l.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5" />
                    <span className="text-xs text-white/50 w-16">F2L #{i + 1}</span>
                    <span className="font-mono text-xs text-white/70">
                      {slot.skipped ? 'Skipped' : slot.moves.join(' ')}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5" />
                  <span className="text-xs text-white/50 w-16">OLL</span>
                  <span className="font-mono text-xs text-white/70">
                    {solve.cfopAnalysis.oll.skipped ? 'Skipped' : solve.cfopAnalysis.oll.moves.join(' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5" />
                  <span className="text-xs text-white/50 w-16">PLL</span>
                  <span className="font-mono text-xs text-white/70">
                    {solve.cfopAnalysis.pll.skipped ? 'Skipped' : solve.cfopAnalysis.pll.moves.join(' ')}
                  </span>
                </div>
              </div>
            </div>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(solve.id)
              }}
              className="mt-2 flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          )}
          {onReplay && solve.solution.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReplay(solve)
              }}
              className="mt-2 ml-4 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <Play className="h-3 w-3" />
              Replay
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function SolvesList({ solves, onDelete }: SolvesListProps) {
  const [replaySolve, setReplaySolve] = useState<Solve | null>(null)

  if (solves.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white/40">
        <p className="text-lg">No solves yet</p>
        <p className="mt-1 text-sm">Complete a solve to see it here</p>
      </div>
    )
  }

  return (
    <>
      {replaySolve && (
        <SolveReplay solve={replaySolve} onClose={() => setReplaySolve(null)} />
      )}
      <div className="flex flex-col gap-2">
        {solves.map((solve, index) => (
          <SolveItem
            key={solve.id}
            solve={solve}
            index={index}
            total={solves.length}
            onDelete={onDelete}
            onReplay={setReplaySolve}
          />
        ))}
      </div>
    </>
  )
}
