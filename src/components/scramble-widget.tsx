import { useMemo } from 'react'
import { createSolvedCube, applyMove, COLOR_HEX, type CubeFaces, type Color } from '@/lib/cube-faces'

interface ScrambleWidgetProps {
  scramble: string
  compact?: boolean
}

function FaceGrid({ colors, size }: { colors: Color[]; size: 'sm' | 'md' }) {
  const cellSize = size === 'sm' ? 'h-4 w-4 min-w-4 min-h-4' : 'h-5 w-5 min-w-5 min-h-5'
  const gap = size === 'sm' ? 'gap-[2px]' : 'gap-0.5'
  
  return (
    <div className={`grid flex-shrink-0 grid-cols-3 ${gap}`}>
      {colors.map((color, idx) => (
        <div
          key={idx}
          className={`${cellSize} flex-shrink-0 rounded-[2px]`}
          style={{ backgroundColor: COLOR_HEX[color] }}
        />
      ))}
    </div>
  )
}

function getScrambledState(scramble: string): CubeFaces {
  if (!scramble) return createSolvedCube()
  const moves = scramble
    .trim()
    .split(/\s+/)
    .filter((m) => m.length > 0)
  let cube = createSolvedCube()
  for (const move of moves) {
    cube = applyMove(cube, move)
  }
  return cube
}

export function ScrambleWidget({ scramble, compact = false }: ScrambleWidgetProps) {
  const faces = useMemo(() => getScrambledState(scramble), [scramble])
  const size = compact ? 'sm' : 'md'

  return (
    <div className="flex justify-center">
      {/* Mobile: Only show F face */}
      <div className="flex md:hidden">
        <FaceGrid colors={faces.F} size={size} />
      </div>

      {/* Desktop: Full cube net */}
      <div className="hidden flex-shrink-0 flex-col gap-[2px] md:inline-flex">
        {/* Row 1: U face aligned with F */}
        <div className="flex gap-[2px]">
          <div className={size === 'sm' ? 'w-[52px]' : 'w-[62px]'} />
          <FaceGrid colors={faces.U} size={size} />
        </div>

        {/* Row 2: L, F, R, B in a row */}
        <div className="flex flex-shrink-0 gap-[2px]">
          <FaceGrid colors={faces.L} size={size} />
          <FaceGrid colors={faces.F} size={size} />
          <FaceGrid colors={faces.R} size={size} />
          <FaceGrid colors={faces.B} size={size} />
        </div>

        {/* Row 3: D face aligned with F */}
        <div className="flex gap-[2px]">
          <div className={size === 'sm' ? 'w-[52px]' : 'w-[62px]'} />
          <FaceGrid colors={faces.D} size={size} />
        </div>
      </div>
    </div>
  )
}
