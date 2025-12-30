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
  colorDot 
}: { 
  name: string
  moves: string[]
  skipped: boolean
  colorDot?: string
}) {
  return (
    <div className="flex flex-col gap-1 py-2 border-b border-neutral-700 last:border-b-0">
      <div className="flex items-center gap-2">
        {colorDot && (
          <div 
            className="w-3 h-3 rounded-full border border-neutral-500" 
            style={{ backgroundColor: colorDot }}
          />
        )}
        <span className="text-sm font-medium text-neutral-300">{name}</span>
        <span className="text-xs text-neutral-500">({skipped ? 0 : moves.length} moves)</span>
      </div>
      <div className="text-sm text-neutral-400 font-mono pl-5">
        {skipped ? (
          <span className="text-neutral-500 italic">Skipped</span>
        ) : (
          moves.join(' ') || <span className="text-neutral-500 italic">—</span>
        )}
      </div>
    </div>
  )
}

export function CFOPAnalysisDisplay({ analysis }: CFOPAnalysisDisplayProps) {
  if (!analysis) {
    return (
      <div className="bg-neutral-800 rounded-lg p-4 text-neutral-500 text-sm">
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
    <div className="bg-neutral-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">CFOP Analysis</h3>
        <span className="text-sm text-neutral-400">{totalMoves} total moves</span>
      </div>
      
      <div className="space-y-0">
        <PhaseRow 
          name={`Cross`}
          moves={analysis.cross.moves}
          skipped={analysis.cross.skipped}
          colorDot={CROSS_COLOR_MAP[analysis.crossColor]}
        />
        
        {analysis.f2l.map((slot, i) => (
          <PhaseRow 
            key={i}
            name={slot.name}
            moves={slot.moves}
            skipped={slot.skipped}
          />
        ))}
        
        <PhaseRow 
          name="OLL"
          moves={analysis.oll.moves}
          skipped={analysis.oll.skipped}
        />
        
        <PhaseRow 
          name="PLL"
          moves={analysis.pll.moves}
          skipped={analysis.pll.skipped}
        />
      </div>
    </div>
  )
}
