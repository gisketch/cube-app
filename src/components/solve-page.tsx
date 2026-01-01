import { useParams, useNavigate } from 'react-router-dom'
import { useSolves } from '@/hooks/useSolves'
import { SolveResults } from '@/components/solve-results'
import { useScrambleTracker } from '@/hooks/useScrambleTracker'

export function SolvePage() {
  const { solveId } = useParams<{ solveId: string }>()
  const navigate = useNavigate()
  const { solves } = useSolves()
  const { setScramble } = useScrambleTracker()

  const solve = solves.find((s) => s.id === solveId)

  if (!solve) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>
          Solve not found
        </div>
        <p className="text-center" style={{ color: 'var(--theme-sub)' }}>
          This solve may have been deleted or you don't have access to it.
        </p>
        <button
          onClick={() => navigate('/account')}
          className="mt-4 rounded-lg px-6 py-2 font-medium transition-colors"
          style={{
            backgroundColor: 'var(--theme-accent)',
            color: 'var(--theme-bg)',
          }}
        >
          Go to Account
        </button>
      </div>
    )
  }

  return (
    <SolveResults
      time={solve.time}
      moves={solve.solution.length}
      analysis={solve.cfopAnalysis || null}
      scramble={solve.scramble}
      showBackButton
      onBack={() => navigate('/account')}
      onRepeatScramble={() => {
        setScramble(solve.scramble)
        navigate('/')
      }}
      solve={solve}
      solveId={solveId}
    />
  )
}
