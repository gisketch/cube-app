import { type CubeFaces, type Color, COLOR_HEX } from '@/lib/cube-faces'

type CubeNetSize = 'sm' | 'md' | 'lg'

interface CubeNetProps {
  faces: CubeFaces | undefined
  size?: CubeNetSize
}

interface FaceGridProps {
  colors: Color[]
  size: CubeNetSize
}

const SIZE_CONFIG = {
  sm: { cell: 'h-3 w-3', gap: 'gap-0.5', empty: 'h-[40px] w-[40px]' },
  md: { cell: 'h-4 w-4', gap: 'gap-0.5', empty: 'h-[52px] w-[52px]' },
  lg: { cell: 'h-6 w-6', gap: 'gap-1', empty: 'h-[80px] w-[80px]' },
}

function FaceGrid({ colors, size }: FaceGridProps) {
  const config = SIZE_CONFIG[size]
  return (
    <div className={`grid grid-cols-3 ${config.gap}`}>
      {colors.map((color, idx) => (
        <div
          key={idx}
          className={`${config.cell} rounded-[2px]`}
          style={{ backgroundColor: COLOR_HEX[color] }}
        />
      ))}
    </div>
  )
}

function EmptyFace({ size }: { size: CubeNetSize }) {
  return <div className={SIZE_CONFIG[size].empty} />
}

export function CubeNet({ faces, size = 'md' }: CubeNetProps) {
  if (!faces) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-white/5 p-4">
        <span className="text-xs text-white/40">Loading...</span>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-4 ${SIZE_CONFIG[size].gap} rounded-lg bg-white/5 p-3`}>
      <EmptyFace size={size} />
      <FaceGrid colors={faces.U} size={size} />
      <EmptyFace size={size} />
      <EmptyFace size={size} />

      <FaceGrid colors={faces.L} size={size} />
      <FaceGrid colors={faces.F} size={size} />
      <FaceGrid colors={faces.R} size={size} />
      <FaceGrid colors={faces.B} size={size} />

      <EmptyFace size={size} />
      <FaceGrid colors={faces.D} size={size} />
      <EmptyFace size={size} />
      <EmptyFace size={size} />
    </div>
  )
}
