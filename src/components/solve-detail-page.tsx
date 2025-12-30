import { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { SolveStatsContent } from './solve-stats-content'
import type { Solve } from '@/hooks/useSolves'
import { calculateSolveStats } from '@/lib/solve-stats'

interface SolveDetailPageProps {
  solve: Solve
  onBack: () => void
}

export function SolveDetailPage({ solve, onBack }: SolveDetailPageProps) {
  const stats = useMemo(() => calculateSolveStats(solve), [solve])

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center gap-4 px-6 py-4"
        style={{ borderBottom: '1px solid var(--theme-subAlt)' }}
      >
        <button
          onClick={onBack}
          className="rounded-lg p-2 transition-colors"
          style={{ color: 'var(--theme-sub)' }}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--theme-text)' }}>
            Solve Details
          </h1>
          <p className="text-sm" style={{ color: 'var(--theme-sub)' }}>
            {(solve.time / 1000).toFixed(2)}s • {new Date(solve.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {stats ? (
          <SolveStatsContent stats={stats} />
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={{ color: 'var(--theme-sub)' }}
          >
            <p>No timing data available for statistics</p>
          </div>
        )}
      </div>
    </div>
  )
}
