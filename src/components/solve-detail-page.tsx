import { useState, useMemo } from 'react'
import { ArrowLeft, Play, BarChart3 } from 'lucide-react'
import { SolveResultsReplay } from './solve-results-replay'
import { SolveStatsContent } from './solve-stats-content'
import type { Solve } from '@/hooks/useSolves'
import { calculateSolveStats } from '@/lib/solve-stats'

type TabType = 'replay' | 'stats'

interface SolveDetailPageProps {
  solve: Solve
  onBack: () => void
  initialTab?: TabType
}

export function SolveDetailPage({ solve, onBack, initialTab = 'stats' }: SolveDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  
  const stats = useMemo(() => calculateSolveStats(solve), [solve])

  const tabs = [
    { id: 'stats' as const, label: 'Statistics', icon: BarChart3 },
    { id: 'replay' as const, label: 'Replay', icon: Play },
  ]

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

        <div 
          className="flex gap-1 rounded-lg p-1"
          style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? 'var(--theme-subAlt)' : 'transparent',
                  color: isActive ? 'var(--theme-text)' : 'var(--theme-sub)',
                }}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'stats' ? (
          stats ? (
            <SolveStatsContent stats={stats} />
          ) : (
            <div className="flex h-full items-center justify-center" style={{ color: 'var(--theme-sub)' }}>
              <p>No timing data available for statistics</p>
            </div>
          )
        ) : (
          <SolveResultsReplay solve={solve} />
        )}
      </div>
    </div>
  )
}
