import { type CubeFaces, type Color, COLOR_HEX } from '@/lib/cube-faces'

interface CubeNetProps {
  faces: CubeFaces | undefined
}

interface FaceGridProps {
  colors: Color[]
}

function FaceGrid({ colors }: FaceGridProps) {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {colors.map((color, idx) => (
        <div
          key={idx}
          className="h-4 w-4 rounded-[2px]"
          style={{ backgroundColor: COLOR_HEX[color] }}
        />
      ))}
    </div>
  )
}

function EmptyFace() {
  return <div className="h-[52px] w-[52px]" />
}

export function CubeNet({ faces }: CubeNetProps) {
  if (!faces) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-white/5 p-4">
        <span className="text-xs text-white/40">Loading...</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-0.5 rounded-lg bg-white/5 p-3">
      <EmptyFace />
      <FaceGrid colors={faces.U} />
      <EmptyFace />
      <EmptyFace />

      <FaceGrid colors={faces.L} />
      <FaceGrid colors={faces.F} />
      <FaceGrid colors={faces.R} />
      <FaceGrid colors={faces.B} />

      <EmptyFace />
      <FaceGrid colors={faces.D} />
      <EmptyFace />
      <EmptyFace />
    </div>
  )
}
