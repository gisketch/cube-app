import { useMemo } from 'react'
import type { SolveStats } from '@/lib/solve-stats'
import { formatTime, formatTPS } from '@/lib/solve-stats'

interface SolveStatsContentProps {
  stats: SolveStats
}

const PHASE_COLORS: Record<string, string> = {
  Cross: '#3B82F6',
  'F2L 1': '#10B981',
  'F2L 2': '#14B8A6',
  'F2L 3': '#06B6D4',
  'F2L 4': '#0EA5E9',
  OLL: '#F59E0B',
  PLL: '#EF4444',
}

export function SolveStatsContent({ stats }: SolveStatsContentProps) {
  const maxPhaseDuration = useMemo(() => {
    return Math.max(...stats.phases.map(p => p.duration), 1)
  }, [stats.phases])

  const maxTPS = useMemo(() => {
    return Math.max(...stats.tpsOverTime.map(p => p.tps), 1)
  }, [stats.tpsOverTime])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard 
          label="Total Time" 
          value={formatTime(stats.totalTime)} 
          subtext={`${stats.totalMoves} moves`}
        />
        <StatCard 
          label="Global TPS" 
          value={formatTPS(stats.globalTPS)} 
          subtext="turns per second"
        />
        <StatCard 
          label="Move Efficiency" 
          value={`${stats.totalMoves}`} 
          subtext={`${stats.rotationCount} rotations`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--theme-bgSecondary)' }}>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-sub)' }}>
            CFOP Splits
          </h3>
          <div className="space-y-3">
            <SplitComparison 
              label="Cross" 
              actual={stats.splits.cross} 
              target={stats.idealSplits.cross}
              color="#3B82F6"
            />
            <SplitComparison 
              label="F2L" 
              actual={stats.splits.f2l} 
              target={stats.idealSplits.f2l}
              color="#10B981"
            />
            <SplitComparison 
              label="OLL" 
              actual={stats.splits.oll} 
              target={stats.idealSplits.oll}
              color="#F59E0B"
            />
            <SplitComparison 
              label="PLL" 
              actual={stats.splits.pll} 
              target={stats.idealSplits.pll}
              color="#EF4444"
            />
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--theme-bgSecondary)' }}>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-sub)' }}>
            Time Breakdown
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-500/50" />
              <span style={{ color: 'var(--theme-sub)' }}>Recognition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-500" />
              <span style={{ color: 'var(--theme-sub)' }}>Execution</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {stats.phases.map((phase) => (
              <PhaseBar 
                key={phase.name}
                phase={phase}
                maxDuration={maxPhaseDuration}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--theme-bgSecondary)' }}>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-sub)' }}>
          TPS Over Time
        </h3>
        <div className="h-48">
          <TPSGraph data={stats.tpsOverTime} maxTPS={maxTPS} totalTime={stats.totalTime} />
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--theme-bgSecondary)' }}>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-sub)' }}>
          Phase Details
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ borderBottom: '1px solid var(--theme-subAlt)', color: 'var(--theme-sub)' }}>
                <th className="pb-3 font-medium">Phase</th>
                <th className="pb-3 font-medium">Moves</th>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">TPS</th>
                <th className="pb-3 font-medium">Recognition</th>
                <th className="pb-3 font-medium">Execution</th>
              </tr>
            </thead>
            <tbody>
              {stats.phases.map((phase) => (
                <tr key={phase.name} style={{ borderBottom: '1px solid var(--theme-subAlt)' }}>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: PHASE_COLORS[phase.name] || '#888' }}
                      />
                      <span style={{ color: 'var(--theme-text)' }}>{phase.name}</span>
                    </div>
                  </td>
                  <td className="py-3 font-mono" style={{ color: 'var(--theme-text)' }}>{phase.moveCount}</td>
                  <td className="py-3 font-mono" style={{ color: 'var(--theme-text)' }}>{formatTime(phase.duration)}</td>
                  <td className="py-3 font-mono" style={{ color: 'var(--theme-text)' }}>{formatTPS(phase.tps)}</td>
                  <td className="py-3 font-mono" style={{ color: 'var(--theme-text)' }}>{formatTime(phase.recognitionTime)}</td>
                  <td className="py-3 font-mono" style={{ color: 'var(--theme-text)' }}>{formatTime(phase.executionTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

function StatCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--theme-bgSecondary)' }}>
      <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-sub)' }}>{label}</div>
      <div className="mt-1 text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>{value}</div>
      <div className="mt-1 text-sm" style={{ color: 'var(--theme-sub)' }}>{subtext}</div>
    </div>
  )
}

function SplitComparison({ 
  label, 
  actual, 
  target, 
  color 
}: { 
  label: string
  actual: number
  target: number
  color: string 
}) {
  const diff = actual - target
  const isOver = diff > 0
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: 'var(--theme-text)' }}>{label}</span>
        <div className="flex items-center gap-3">
          <span className="font-mono" style={{ color: 'var(--theme-text)' }}>{actual.toFixed(1)}%</span>
          <span className={`text-xs ${isOver ? 'text-red-400' : 'text-green-400'}`}>
            {isOver ? '+' : ''}{diff.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--theme-subAlt)' }}>
        <div 
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{ 
            width: `${Math.min(actual, 100)}%`, 
            backgroundColor: color 
          }}
        />
        <div 
          className="absolute top-0 h-full w-0.5 bg-white/50"
          style={{ left: `${target}%` }}
        />
      </div>
    </div>
  )
}

function PhaseBar({ 
  phase, 
  maxDuration 
}: { 
  phase: { name: string; duration: number; recognitionTime: number; executionTime: number }
  maxDuration: number
}) {
  const totalWidth = (phase.duration / maxDuration) * 100
  const recognitionWidth = (phase.recognitionTime / phase.duration) * 100 || 0
  const color = PHASE_COLORS[phase.name] || '#888'

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 text-xs" style={{ color: 'var(--theme-sub)' }}>{phase.name.replace('F2L ', 'F')}</div>
      <div 
        className="relative h-6 flex-1 overflow-hidden rounded group"
        style={{ backgroundColor: 'var(--theme-subAlt)' }}
      >
        <div 
          className="absolute left-0 top-0 flex h-full"
          style={{ width: `${totalWidth}%` }}
        >
          <div 
            className="h-full relative cursor-pointer"
            style={{ 
              width: `${recognitionWidth}%`,
              backgroundColor: color,
              opacity: 0.4
            }}
            title={`Recognition: ${formatTime(phase.recognitionTime)}`}
          >
            <div 
              className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
            >
              Recognition: {formatTime(phase.recognitionTime)}
            </div>
          </div>
          <div 
            className="h-full flex-1 relative cursor-pointer"
            style={{ backgroundColor: color }}
            title={`Execution: ${formatTime(phase.executionTime)}`}
          >
            <div 
              className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
            >
              Execution: {formatTime(phase.executionTime)}
            </div>
          </div>
        </div>
      </div>
      <div className="w-16 text-right font-mono text-xs" style={{ color: 'var(--theme-sub)' }}>
        {formatTime(phase.duration)}
      </div>
    </div>
  )
}

function TPSGraph({ 
  data, 
  maxTPS, 
  totalTime 
}: { 
  data: { time: number; tps: number; phase: string }[]
  maxTPS: number
  totalTime: number
}) {
  if (data.length < 2) {
    return (
      <div className="flex h-full items-center justify-center" style={{ color: 'var(--theme-sub)' }}>
        Not enough data for TPS graph
      </div>
    )
  }

  const points = data.map(d => ({
    x: (d.time / totalTime) * 100,
    y: 100 - (d.tps / maxTPS) * 100,
    phase: d.phase
  }))

  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`
    return `${acc} L ${point.x} ${point.y}`
  }, '')

  const areaD = `${pathD} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`

  return (
    <div className="relative h-full">
      <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-xs" style={{ color: 'var(--theme-sub)' }}>
        <span>{maxTPS.toFixed(1)}</span>
        <span>{(maxTPS / 2).toFixed(1)}</span>
        <span>0</span>
      </div>
      <div className="ml-10 h-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {[0, 25, 50, 75, 100].map(y => (
            <line 
              key={y}
              x1="0" 
              y1={y} 
              x2="100" 
              y2={y} 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth="0.5"
            />
          ))}
          
          <path d={areaD} fill="url(#tpsGradient)" />
          <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="ml-10 mt-1 flex justify-between text-xs" style={{ color: 'var(--theme-sub)' }}>
        <span>0s</span>
        <span>{formatTime(totalTime)}</span>
      </div>
    </div>
  )
}


