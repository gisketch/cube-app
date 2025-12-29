import * as THREE from 'three'
import { useMemo, type ReactNode } from 'react'

const CUBE_SIZE = 0.95
const GAP = 0.05
const OFFSET = 1 + GAP

// Stickerless colors (vibrant)
const COLORS = {
  white: '#ffffff',
  yellow: '#ffd500',
  red: '#b90000',
  orange: '#ff5900',
  blue: '#0045ad',
  green: '#009b48',
  inner: '#0a0a0a', // Darker black for internals
}

type PieceType = 'corner' | 'edge' | 'center'
type FacePosition = 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back'

interface CubieFaceProps {
  pieceType: PieceType
  color: string
  rotation?: number
}

// Geometry constants
const FACE_SIZE = CUBE_SIZE * 0.48 // Almost full coverage (0.96 total width)
const EXTRUDE_SETTINGS = {
  depth: 0.05,
  bevelEnabled: true,
  bevelThickness: 0.02,
  bevelSize: 0.02,
  bevelSegments: 4,
}

function createCornerShape(): THREE.Shape {
  const size = FACE_SIZE
  const radius = 0.08 // Small radius for "square sharp" look
  const shape = new THREE.Shape()

  shape.moveTo(-size + radius, -size)
  shape.lineTo(size - radius, -size)
  shape.quadraticCurveTo(size, -size, size, -size + radius)
  shape.lineTo(size, size - radius)
  shape.quadraticCurveTo(size, size, size - radius, size)
  shape.lineTo(-size + radius, size)
  shape.quadraticCurveTo(-size, size, -size, size - radius)
  shape.lineTo(-size, -size + radius)
  shape.quadraticCurveTo(-size, -size, -size + radius, -size)

  return shape
}

function createEdgeShape(): THREE.Shape {
  const size = FACE_SIZE
  const smallRadius = 0.04 // Sharp-ish
  const bigRadius = 0.25 // Rounded (inside)

  const shape = new THREE.Shape()

  // Orientation: +y is "Outside", -y is "Inside"
  // Top-Left (-x, +y) & Top-Right (+x, +y): Small Radius
  // Bottom-Left (-x, -y) & Bottom-Right (+x, -y): Big Radius

  // Start from bottom-left
  shape.moveTo(-size + bigRadius, -size)
  
  // Bottom edge to bottom-right
  shape.lineTo(size - bigRadius, -size)
  shape.quadraticCurveTo(size, -size, size, -size + bigRadius)
  
  // Right edge to top-right
  shape.lineTo(size, size - smallRadius)
  shape.quadraticCurveTo(size, size, size - smallRadius, size)
  
  // Top edge to top-left
  shape.lineTo(-size + smallRadius, size)
  shape.quadraticCurveTo(-size, size, -size, size - smallRadius)
  
  // Left edge to bottom-left
  shape.lineTo(-size, -size + bigRadius)
  shape.quadraticCurveTo(-size, -size, -size + bigRadius, -size)

  return shape
}

function createCenterShape(): THREE.Shape {
  const size = FACE_SIZE
  const chamfer = 0.15 // Diagonal corners
  const shape = new THREE.Shape()

  shape.moveTo(-size + chamfer, -size)
  shape.lineTo(size - chamfer, -size)
  shape.lineTo(size, -size + chamfer)
  shape.lineTo(size, size - chamfer)
  shape.lineTo(size - chamfer, size)
  shape.lineTo(-size + chamfer, size)
  shape.lineTo(-size, size - chamfer)
  shape.lineTo(-size, -size + chamfer)
  shape.closePath()

  return shape
}

function CubieFace({ pieceType, color, rotation = 0 }: CubieFaceProps) {
  const geometry = useMemo(() => {
    let shape: THREE.Shape

    if (pieceType === 'corner') {
      shape = createCornerShape()
    } else if (pieceType === 'edge') {
      shape = createEdgeShape()
    } else {
      shape = createCenterShape()
    }

    // Center the geometry
    const geo = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS)
    geo.center()
    return geo
  }, [pieceType])

  return (
    <mesh geometry={geometry} rotation={[0, 0, rotation]}>
      <meshPhysicalMaterial
        color={color}
        roughness={0.1}
        metalness={0.0}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        reflectivity={0.5}
      />
    </mesh>
  )
}

interface CubieProps {
  position: [number, number, number]
  colors: {
    top?: string
    bottom?: string
    left?: string
    right?: string
    front?: string
    back?: string
  }
  pieceType: PieceType
  coords: { x: number; y: number; z: number }
}

function getFaceRotation(
  face: FacePosition,
  x: number,
  y: number,
  z: number
): number {
  // Returns rotation in radians for the face shape
  // Goal: Align shape's +y (Outside) with the cube's outer edge direction

  if (face === 'top') {
    // Top Face (y=1). Default Up points to Back (-z)
    if (z === 1) return Math.PI // Front Edge -> Rotate 180
    if (z === -1) return 0 // Back Edge -> Rotate 0
    if (x === 1) return -Math.PI / 2 // Right Edge -> Rotate -90
    if (x === -1) return Math.PI / 2 // Left Edge -> Rotate 90
  }

  if (face === 'bottom') {
    // Bottom Face (y=-1). Default Up points to Front (+z)
    if (z === 1) return 0 // Front Edge -> Rotate 0
    if (z === -1) return Math.PI // Back Edge -> Rotate 180
    if (x === 1) return Math.PI / 2 // Right Edge -> Rotate 90
    if (x === -1) return -Math.PI / 2 // Left Edge -> Rotate -90
  }

  if (face === 'front') {
    // Front Face (z=1). Default Up points to Top (+y)
    if (y === 1) return 0 // Top Edge -> Rotate 0
    if (y === -1) return Math.PI // Bottom Edge -> Rotate 180
    if (x === 1) return -Math.PI / 2 // Right Edge -> Rotate -90
    if (x === -1) return Math.PI / 2 // Left Edge -> Rotate 90
  }

  if (face === 'back') {
    // Back Face (z=-1). Default Up points to Top (+y)
    if (y === 1) return 0 // Top Edge -> Rotate 0
    if (y === -1) return Math.PI // Bottom Edge -> Rotate 180
    if (x === 1) return Math.PI / 2 // Right Edge (World Right) -> Rotate 90
    if (x === -1) return -Math.PI / 2 // Left Edge (World Left) -> Rotate -90
  }

  if (face === 'right') {
    // Right Face (x=1). Default Up points to Top (+y)
    if (y === 1) return 0 // Top Edge -> Rotate 0
    if (y === -1) return Math.PI // Bottom Edge -> Rotate 180
    if (z === 1) return Math.PI / 2 // Front Edge -> Rotate 90
    if (z === -1) return -Math.PI / 2 // Back Edge -> Rotate -90
  }

  if (face === 'left') {
    // Left Face (x=-1). Default Up points to Top (+y)
    if (y === 1) return 0 // Top Edge -> Rotate 0
    if (y === -1) return Math.PI // Bottom Edge -> Rotate 180
    if (z === 1) return -Math.PI / 2 // Front Edge -> Rotate -90
    if (z === -1) return Math.PI / 2 // Back Edge -> Rotate 90
  }

  return 0
}

function Cubie({ position, colors, pieceType, coords }: CubieProps) {
  // Position faces slightly outside the inner box
  const faceOffset = CUBE_SIZE / 2

  return (
    <group position={position}>
      {/* Inner black mechanism */}
      <mesh>
        <boxGeometry args={[CUBE_SIZE * 0.98, CUBE_SIZE * 0.98, CUBE_SIZE * 0.98]} />
        <meshStandardMaterial
          color={COLORS.inner}
          roughness={0.5}
          metalness={0.5}
        />
      </mesh>

      {colors.top && (
        <group position={[0, faceOffset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <CubieFace
            pieceType={pieceType}
            color={colors.top}
            rotation={getFaceRotation('top', coords.x, coords.y, coords.z)}
          />
        </group>
      )}
      {colors.bottom && (
        <group position={[0, -faceOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <CubieFace
            pieceType={pieceType}
            color={colors.bottom}
            rotation={getFaceRotation('bottom', coords.x, coords.y, coords.z)}
          />
        </group>
      )}
      {colors.front && (
        <group position={[0, 0, faceOffset]}>
          <CubieFace
            pieceType={pieceType}
            color={colors.front}
            rotation={getFaceRotation('front', coords.x, coords.y, coords.z)}
          />
        </group>
      )}
      {colors.back && (
        <group position={[0, 0, -faceOffset]} rotation={[0, Math.PI, 0]}>
          <CubieFace
            pieceType={pieceType}
            color={colors.back}
            rotation={getFaceRotation('back', coords.x, coords.y, coords.z)}
          />
        </group>
      )}
      {colors.right && (
        <group position={[faceOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <CubieFace
            pieceType={pieceType}
            color={colors.right}
            rotation={getFaceRotation('right', coords.x, coords.y, coords.z)}
          />
        </group>
      )}
      {colors.left && (
        <group position={[-faceOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <CubieFace
            pieceType={pieceType}
            color={colors.left}
            rotation={getFaceRotation('left', coords.x, coords.y, coords.z)}
          />
        </group>
      )}
    </group>
  )
}

function getPieceType(x: number, y: number, z: number): PieceType {
  const nonZeroCount = [x, y, z].filter((v) => v !== 0).length
  if (nonZeroCount === 3) return 'corner'
  if (nonZeroCount === 2) return 'edge'
  return 'center'
}

function getCubieColors(
  x: number,
  y: number,
  z: number
): CubieProps['colors'] {
  const colors: CubieProps['colors'] = {}

  if (y === 1) colors.top = COLORS.white
  if (y === -1) colors.bottom = COLORS.yellow
  if (z === 1) colors.front = COLORS.green
  if (z === -1) colors.back = COLORS.blue
  if (x === 1) colors.right = COLORS.red
  if (x === -1) colors.left = COLORS.orange

  return colors
}

export function RubiksCube() {
  const cubies: ReactNode[] = []

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue

        const key = `${x}-${y}-${z}`
        const position: [number, number, number] = [
          x * OFFSET,
          y * OFFSET,
          z * OFFSET,
        ]
        const colors = getCubieColors(x, y, z)
        const pieceType = getPieceType(x, y, z)

        cubies.push(
          <Cubie
            key={key}
            position={position}
            colors={colors}
            pieceType={pieceType}
            coords={{ x, y, z }}
          />
        )
      }
    }
  }

  return <group>{cubies}</group>
}
