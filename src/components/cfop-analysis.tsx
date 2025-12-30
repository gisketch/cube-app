import { type CFOPAnalysis } from '@/lib/cfop-analyzer'

interface CFOPAnalysisDisplayProps {
  analysis: CFOPAnalysis | null
}

const CROSS_COLOR_MAP: Record<string, string> = {
  W: '#FFFFFF',
  Y: '#FFEB3B',
  G: '#4CAF50',
  B: '#2196F3',
  R: '#F44336',
  O: '#FF9800',
}

function PhaseRow({
  name,
  moves,
  skipped,
  colorDot,
}: {
  name: string
  moves: string[]
  skipped: boolean
  colorDot?: string
}) {
  return (
    <div
      className="flex flex-col gap-1 py-2 last:border-b-0"
      style={{ borderBottom: '1px solid var(--theme-subAlt)' }}
    >
      <div className="flex items-center gap-2">
        {colorDot && (
          <div
            className="h-3 w-3 rounded-full"
            style={{
              backgroundColor: colorDot,
              border: '1px solid var(--theme-sub)',
            }}
          />
        )}
        <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
          {name}
        </span>
        <span className="text-xs" style={{ color: 'var(--theme-sub)' }}>
          ({skipped ? 0 : moves.length} moves)
        </span>
      </div>
      <div className="pl-5 font-mono text-sm" style={{ color: 'var(--theme-sub)' }}>
        {skipped ? (
          <span className="italic">Skipped</span>
        ) : (
          moves.join(' ') || <span className="italic">—</span>
        )}
      </div>
    </div>
  )
}

export function CFOPAnalysisDisplay({ analysis }: CFOPAnalysisDisplayProps) {
  if (!analysis) {
    return (
      <div
        className="rounded-lg p-4 text-sm"
        style={{ backgroundColor: 'var(--theme-bgSecondary)', color: 'var(--theme-sub)' }}
      >
        No CFOP analysis available yet. Complete a solve to see the breakdown.
      </div>
    )
  }

  const totalMoves =
    analysis.cross.moves.length +
    analysis.f2l.reduce((sum, slot) => sum + slot.moves.length, 0) +
    analysis.oll.moves.length +
    analysis.pll.moves.length

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--theme-bgSecondary)' }}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>
          CFOP Analysis
        </h3>
        <span className="text-sm" style={{ color: 'var(--theme-sub)' }}>
          {totalMoves} total moves
        </span>
      </div>

      <div className="space-y-0">
        <PhaseRow
          name={`Cross`}
          moves={analysis.cross.moves}
          skipped={analysis.cross.skipped}
          colorDot={CROSS_COLOR_MAP[analysis.crossColor]}
        />

        {analysis.f2l.map((slot, i) => (
          <PhaseRow key={i} name={slot.name} moves={slot.moves} skipped={slot.skipped} />
        ))}

        <PhaseRow name="OLL" moves={analysis.oll.moves} skipped={analysis.oll.skipped} />

        <PhaseRow name="PLL" moves={analysis.pll.moves} skipped={analysis.pll.skipped} />
      </div>
    </div>
  )
}
