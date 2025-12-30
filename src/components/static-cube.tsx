import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { type CubeFaces, type Color, COLOR_HEX } from '@/lib/cube-faces'

interface StaticCubeProps {
  faces: CubeFaces
}

const FACE_POSITIONS: Record<keyof CubeFaces, { position: [number, number, number]; rotation: [number, number, number] }> = {
  U: { position: [0, 1.5, 0], rotation: [-Math.PI / 2, 0, 0] },
  D: { position: [0, -1.5, 0], rotation: [Math.PI / 2, 0, 0] },
  F: { position: [0, 0, 1.5], rotation: [0, 0, 0] },
  B: { position: [0, 0, -1.5], rotation: [0, Math.PI, 0] },
  L: { position: [-1.5, 0, 0], rotation: [0, -Math.PI / 2, 0] },
  R: { position: [1.5, 0, 0], rotation: [0, Math.PI / 2, 0] },
}

function Sticker({ color, position }: { color: Color; position: [number, number, number] }) {
  const hexColor = COLOR_HEX[color]
  
  return (
    <mesh position={position}>
      <planeGeometry args={[0.9, 0.9]} />
      <meshStandardMaterial color={hexColor} />
    </mesh>
  )
}

function CubeFace({ colors, position, rotation }: { 
  colors: Color[]
  position: [number, number, number]
  rotation: [number, number, number]
}) {
  const stickerPositions: [number, number, number][] = [
    [-1, 1, 0.01], [0, 1, 0.01], [1, 1, 0.01],
    [-1, 0, 0.01], [0, 0, 0.01], [1, 0, 0.01],
    [-1, -1, 0.01], [0, -1, 0.01], [1, -1, 0.01],
  ]

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {colors.map((color, idx) => (
        <Sticker key={idx} color={color} position={stickerPositions[idx]} />
      ))}
    </group>
  )
}

function CubeModel({ faces }: { faces: CubeFaces }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.95, 2.95, 2.95]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {(Object.keys(faces) as (keyof CubeFaces)[]).map((face) => (
        <CubeFace
          key={face}
          colors={faces[face]}
          position={FACE_POSITIONS[face].position}
          rotation={FACE_POSITIONS[face].rotation}
        />
      ))}
    </group>
  )
}

export function StaticCube({ faces }: StaticCubeProps) {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [4, 3, 4], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.4} />
        <CubeModel faces={faces} />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  )
}
