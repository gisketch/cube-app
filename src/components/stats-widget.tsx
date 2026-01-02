import { useMemo } from 'react'
import { BarChart3, Trophy, TrendingDown, Timer, ChevronDown, ChevronUp, Award } from 'lucide-react'
import type { Solve } from '@/types'
import { calculateSessionStats, type SessionStats } from '@/lib/session-stats'
import { formatTime } from '@/lib/format'

interface StatsWidgetProps {
  solves: Solve[]
  isVisible: boolean
  onToggleVisibility: () => void
  compact?: boolean
}

interface StatItemProps {
  icon: typeof Trophy
  label: string
  value: string
  highlight?: boolean
  compact?: boolean
}

function StatItem({ icon: Icon, label, value, highlight, compact }: StatItemProps) {
  return (
    <div 
      className={`flex items-center gap-2 rounded-md ${compact ? 'px-2 py-1.5' : 'px-2 py-1.5'}`}
      style={{ backgroundColor: 'var(--theme-subAlt)' }}
    >
      <Icon 
        className="h-3 w-3 flex-shrink-0" 
        style={{ color: highlight ? 'var(--theme-accent)' : 'var(--theme-sub)' }} 
      />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
        <span 
          className="text-[10px] flex-shrink-0"
          style={{ color: 'var(--theme-sub)' }}
        >
          {label}
        </span>
        <span 
          className="text-xs font-medium tabular-nums truncate"
          style={{ color: 'var(--theme-text)' }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

export function StatsWidget({ solves, isVisible, onToggleVisibility, compact = false }: StatsWidgetProps) {
  const stats: SessionStats = useMemo(() => calculateSessionStats(solves), [solves])

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--theme-subAlt)]"
      >
        <BarChart3 className="h-4 w-4" style={{ color: 'var(--theme-sub)' }} />
        <span className="text-sm" style={{ color: 'var(--theme-sub)' }}>show stats</span>
        <ChevronDown className="h-3 w-3" style={{ color: 'var(--theme-sub)' }} />
      </button>
    )
  }

  const hasStats = stats.solveCount > 0

  return (
    <div className="flex flex-col p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" style={{ color: 'var(--theme-sub)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
            stats
          </span>
        </div>
        <button
          onClick={onToggleVisibility}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-[var(--theme-subAlt)]"
          style={{ color: 'var(--theme-sub)' }}
        >
          hide
          <ChevronUp className="h-3 w-3" />
        </button>
      </div>

      {!hasStats ? (
        <div 
          className="py-4 text-center text-sm"
          style={{ color: 'var(--theme-sub)' }}
        >
          Complete some solves to see stats
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1.5">
          <StatItem
            icon={Trophy}
            label="pb"
            value={stats.best ? formatTime(stats.best) : '-'}
            highlight
            compact={compact}
          />
          <StatItem
            icon={Award}
            label="ao5 pb"
            value={stats.ao5Best ? formatTime(stats.ao5Best) : '-'}
            highlight
            compact={compact}
          />
          <StatItem
            icon={Award}
            label="ao12 pb"
            value={stats.ao12Best ? formatTime(stats.ao12Best) : '-'}
            highlight
            compact={compact}
          />
          <StatItem
            icon={Timer}
            label="avg"
            value={stats.average ? formatTime(stats.average) : '-'}
            compact={compact}
          />
          <StatItem
            icon={Timer}
            label="ao5"
            value={stats.ao5 ? formatTime(stats.ao5) : '-'}
            compact={compact}
          />
          <StatItem
            icon={Timer}
            label="ao12"
            value={stats.ao12 ? formatTime(stats.ao12) : '-'}
            compact={compact}
          />
          <StatItem
            icon={TrendingDown}
            label="worst"
            value={stats.worst ? formatTime(stats.worst) : '-'}
            compact={compact}
          />
        </div>
      )}
    </div>
  )
}

export function MobileStatsButton({ solves, isVisible, onToggleVisibility }: Omit<StatsWidgetProps, 'compact'>) {
  const stats = useMemo(() => calculateSessionStats(solves), [solves])

  return (
    <div className="w-full">
      <button
        onClick={onToggleVisibility}
        className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 transition-colors"
        style={{ 
          backgroundColor: 'var(--theme-bgSecondary)',
          color: 'var(--theme-sub)' 
        }}
      >
        <BarChart3 className="h-4 w-4" />
        <span className="text-sm">
          {isVisible ? 'Hide Stats' : 'Show Stats'}
        </span>
        {isVisible ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {isVisible && (
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <StatItem icon={Trophy} label="pb" value={stats.best ? formatTime(stats.best) : '-'} highlight compact />
          <StatItem icon={TrendingDown} label="worst" value={stats.worst ? formatTime(stats.worst) : '-'} compact />
          <StatItem icon={Timer} label="avg" value={stats.average ? formatTime(stats.average) : '-'} compact />
          <StatItem icon={Timer} label="ao5" value={stats.ao5 ? formatTime(stats.ao5) : '-'} compact />
          <StatItem icon={Timer} label="ao12" value={stats.ao12 ? formatTime(stats.ao12) : '-'} compact />
          <StatItem icon={Award} label="ao5 pb" value={stats.ao5Best ? formatTime(stats.ao5Best) : '-'} highlight compact />
          <StatItem icon={Award} label="ao12 pb" value={stats.ao12Best ? formatTime(stats.ao12Best) : '-'} highlight compact />
        </div>
      )}
    </div>
  )
}
