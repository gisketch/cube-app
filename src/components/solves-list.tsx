import { useMemo } from 'react'
import { Trash2, BarChart3, Play } from 'lucide-react'
import type { Solve } from '@/hooks/useSolves'
import { createSolvedCube, applyMove, COLOR_HEX, type CubeFaces } from '@/lib/cube-faces'

interface SolvesListProps {
  solves: Solve[]
  onDelete?: (id: string) => void
  onViewDetails?: (solve: Solve) => void
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

function getScrambledState(scramble: string): CubeFaces {
  const moves = scramble.trim().split(/\s+/).filter((m) => m.length > 0)
  let cube = createSolvedCube()
  for (const move of moves) {
    cube = applyMove(cube, move)
  }
  return cube
}

function MiniFace({ face }: { face: string[] }) {
  return (
    <div className="grid grid-cols-3 gap-[1px]" style={{ width: 27, height: 27 }}>
      {face.map((color, i) => (
        <div
          key={i}
          className="rounded-[1px]"
          style={{
            backgroundColor: COLOR_HEX[color as keyof typeof COLOR_HEX] || '#888',
            width: 8,
            height: 8,
          }}
        />
      ))}
    </div>
  )
}

function SolveRow({
  solve,
  index,
  total,
  onDelete,
  onViewDetails,
}: {
  solve: Solve
  index: number
  total: number
  onDelete?: (id: string) => void
  onViewDetails?: (solve: Solve) => void
}) {
  const scrambledState = useMemo(() => getScrambledState(solve.scramble), [solve.scramble])
  const solveNumber = total - index

  const handleRowClick = () => {
    if (onViewDetails) {
      onViewDetails(solve)
    }
  }

  return (
    <tr
      className="cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid var(--theme-subAlt)' }}
      onClick={handleRowClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--theme-bgSecondary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <td className="px-3 py-3 text-center" style={{ color: 'var(--theme-sub)', width: 50 }}>
        <span className="text-sm font-medium">#{solveNumber}</span>
      </td>
      <td className="px-3 py-3" style={{ width: 45 }}>
        <MiniFace face={scrambledState.F} />
      </td>
      <td className="px-4 py-3" style={{ width: 100 }}>
        <span
          className="font-mono text-lg font-semibold"
          style={{ color: 'var(--theme-text)' }}
        >
          {formatTime(solve.time)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className="line-clamp-1 font-mono text-xs"
          style={{ color: 'var(--theme-sub)' }}
        >
          {solve.scramble}
        </span>
      </td>
      <td className="px-3 py-3 text-right" style={{ width: 120 }}>
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onViewDetails) onViewDetails(solve)
            }}
            className="rounded p-1.5 transition-colors hover:opacity-80"
            style={{ color: 'var(--theme-accent)' }}
            title="Full Stats"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
          {solve.solution.length > 0 && solve.gyroData && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onViewDetails) onViewDetails(solve)
              }}
              className="rounded p-1.5 transition-colors hover:opacity-80"
              style={{ color: 'var(--theme-accent)' }}
              title="Replay"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(solve.id)
              }}
              className="rounded p-1.5 transition-colors hover:opacity-80"
              style={{ color: 'var(--theme-error)' }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export function SolvesList({ solves, onDelete, onViewDetails }: SolvesListProps) {
  if (solves.length === 0) {
    return (
      <div
        className="flex h-64 flex-col items-center justify-center"
        style={{ color: 'var(--theme-sub)' }}
      >
        <p className="text-lg">No solves yet</p>
        <p className="mt-1 text-sm">Complete a solve to see it here</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--theme-subAlt)' }}>
            <th
              className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--theme-sub)', width: 50 }}
            >
              #
            </th>
            <th
              className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--theme-sub)', width: 45 }}
            >
              
            </th>
            <th
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--theme-sub)', width: 100 }}
            >
              Time
            </th>
            <th
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--theme-sub)' }}
            >
              Scramble
            </th>
            <th
              className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--theme-sub)', width: 120 }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {solves.map((solve, index) => (
            <SolveRow
              key={solve.id}
              solve={solve}
              index={index}
              total={solves.length}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
