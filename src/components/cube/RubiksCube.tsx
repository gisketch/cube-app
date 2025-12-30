import * as THREE from 'three'
import { useMemo, useRef, forwardRef, useImperativeHandle, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import type { KPattern } from 'cubing/kpuzzle'
import { patternToFacelets, COLOR_MAP, type FaceletColor } from '@/lib/cube-state'
import { type SceneConfig, DEFAULT_CONFIG } from '@/config/scene-config'

const BASE_CUBE_SIZE = 0.95
const BASE_GAP = 0.0
const BASE_OFFSET = 1 + BASE_GAP

const CUBE_SIZE = BASE_CUBE_SIZE
const OFFSET = BASE_OFFSET

export interface CubeColors {
  white: string
  yellow: string
  red: string
  orange: string
  blue: string
  green: string
  inner: string
}

const INNER_COLOR = '#0a0a0a'

const DEFAULT_CUBE_COLORS: CubeColors = {
  white: '#ffffff',
  yellow: '#ffd500',
  red: '#b90000',
  orange: '#ff5900',
  blue: '#0045ad',
  green: '#009b48',
  inner: '#0a0a0a',
}

type PieceType = 'corner' | 'edge' | 'center'
type FacePosition = 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back'

interface CubieFaceProps {
  pieceType: PieceType
  color: string
  rotation?: number
  materialConfig: SceneConfig['material']['face']
}

const FACE_SIZE = BASE_CUBE_SIZE * 0.48
const EXTRUDE_SETTINGS = {
  depth: 0.04,
  bevelEnabled: true,
  bevelThickness: 0.02,
  bevelSize: 0.02,
  bevelSegments: 4,
}

function createCornerShape(): THREE.Shape {
  const size = FACE_SIZE
  const radius = 0.08
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
  const smallRadius = 0.04
  const bigRadius = 0.25

  const shape = new THREE.Shape()

  shape.moveTo(-size + bigRadius, -size)
  shape.lineTo(size - bigRadius, -size)
  shape.quadraticCurveTo(size, -size, size, -size + bigRadius)
  shape.lineTo(size, size - smallRadius)
  shape.quadraticCurveTo(size, size, size - smallRadius, size)
  shape.lineTo(-size + smallRadius, size)
  shape.quadraticCurveTo(-size, size, -size, size - smallRadius)
  shape.lineTo(-size, -size + bigRadius)
  shape.quadraticCurveTo(-size, -size, -size + bigRadius, -size)

  return shape
}

function createCenterShape(): THREE.Shape {
  const size = FACE_SIZE
  const chamfer = 0.15
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

function CubieFace({ pieceType, color, rotation = 0, materialConfig }: CubieFaceProps) {
  const geometry = useMemo(() => {
    let shape: THREE.Shape

    if (pieceType === 'corner') {
      shape = createCornerShape()
    } else if (pieceType === 'edge') {
      shape = createEdgeShape()
    } else {
      shape = createCenterShape()
    }

    const geo = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS)
    geo.center()
    return geo
  }, [pieceType])

  return (
    <mesh geometry={geometry} rotation={[0, 0, rotation]}>
      <meshPhysicalMaterial
        color={color}
        roughness={materialConfig.roughness}
        metalness={materialConfig.metalness}
        clearcoat={materialConfig.clearcoat}
        clearcoatRoughness={materialConfig.clearcoatRoughness}
        reflectivity={materialConfig.reflectivity}
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
  materialConfig: SceneConfig['material']
}

function getFaceRotation(face: FacePosition, x: number, y: number, z: number): number {
  if (face === 'top') {
    if (z === 1) return Math.PI
    if (z === -1) return 0
    if (x === 1) return -Math.PI / 2
    if (x === -1) return Math.PI / 2
  }

  if (face === 'bottom') {
    if (z === 1) return 0
    if (z === -1) return Math.PI
    if (x === 1) return -Math.PI / 2
    if (x === -1) return Math.PI / 2
  }

  if (face === 'front') {
    if (y === 1) return 0
    if (y === -1) return Math.PI
    if (x === 1) return -Math.PI / 2
    if (x === -1) return Math.PI / 2
  }

  if (face === 'back') {
    if (y === 1) return 0
    if (y === -1) return Math.PI
    if (x === 1) return Math.PI / 2
    if (x === -1) return -Math.PI / 2
  }

  if (face === 'right') {
    if (y === 1) return 0
    if (y === -1) return Math.PI
    if (z === 1) return Math.PI / 2
    if (z === -1) return -Math.PI / 2
  }

  if (face === 'left') {
    if (y === 1) return 0
    if (y === -1) return Math.PI
    if (z === 1) return -Math.PI / 2
    if (z === -1) return Math.PI / 2
  }

  return 0
}

function Cubie({ position, colors, pieceType, coords, materialConfig }: CubieProps) {
  const faceOffset = CUBE_SIZE * 0.46
  const { inner } = materialConfig

  const centerBodyGeometry = useMemo(() => {
    if (pieceType !== 'center') return null
    const shape = createCenterShape()
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: CUBE_SIZE * 0.92,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 4,
    })
    geo.center()
    return geo
  }, [pieceType])

  return (
    <group position={position}>
      {pieceType === 'center' ? (
        <group
          rotation={
            colors.top
              ? [-Math.PI / 2, 0, 0]
              : colors.bottom
                ? [Math.PI / 2, 0, 0]
                : colors.front
                  ? [0, 0, 0]
                  : colors.back
                    ? [0, Math.PI, 0]
                    : colors.right
                      ? [0, Math.PI / 2, 0]
                      : colors.left
                        ? [0, -Math.PI / 2, 0]
                        : [0, 0, 0]
          }
        >
          <mesh geometry={centerBodyGeometry!}>
            <meshStandardMaterial
              color={INNER_COLOR}
              roughness={inner.roughness}
              metalness={inner.metalness}
            />
          </mesh>
        </group>
      ) : (
        <RoundedBox
          args={[CUBE_SIZE * 0.96, CUBE_SIZE * 0.96, CUBE_SIZE * 0.96]}
          radius={0.08}
          smoothness={4}
        >
          <meshStandardMaterial
            color={INNER_COLOR}
            roughness={inner.roughness}
            metalness={inner.metalness}
          />
        </RoundedBox>
      )}

      {colors.top && (
        <group position={[0, faceOffset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <CubieFace
            pieceType={pieceType}
            color={colors.top}
            rotation={getFaceRotation('top', coords.x, coords.y, coords.z)}
            materialConfig={materialConfig.face}
          />
        </group>
      )}
      {colors.bottom && (
        <group position={[0, -faceOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <CubieFace
            pieceType={pieceType}
            color={colors.bottom}
            rotation={getFaceRotation('bottom', coords.x, coords.y, coords.z)}
            materialConfig={materialConfig.face}
          />
        </group>
      )}
      {colors.front && (
        <group position={[0, 0, faceOffset]}>
          <CubieFace
            pieceType={pieceType}
            color={colors.front}
            rotation={getFaceRotation('front', coords.x, coords.y, coords.z)}
            materialConfig={materialConfig.face}
          />
        </group>
      )}
      {colors.back && (
        <group position={[0, 0, -faceOffset]} rotation={[0, Math.PI, 0]}>
          <CubieFace
            pieceType={pieceType}
            color={colors.back}
            rotation={getFaceRotation('back', coords.x, coords.y, coords.z)}
            materialConfig={materialConfig.face}
          />
        </group>
      )}
      {colors.right && (
        <group position={[faceOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <CubieFace
            pieceType={pieceType}
            color={colors.right}
            rotation={getFaceRotation('right', coords.x, coords.y, coords.z)}
            materialConfig={materialConfig.face}
          />
        </group>
      )}
      {colors.left && (
        <group position={[-faceOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <CubieFace
            pieceType={pieceType}
            color={colors.left}
            rotation={getFaceRotation('left', coords.x, coords.y, coords.z)}
            materialConfig={materialConfig.face}
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

function getDefaultColors(
  x: number,
  y: number,
  z: number,
  cubeColors: CubeColors,
): CubieProps['colors'] {
  const colors: CubieProps['colors'] = {}
  if (y === 1) colors.top = cubeColors.white
  if (y === -1) colors.bottom = cubeColors.yellow
  if (z === 1) colors.front = cubeColors.green
  if (z === -1) colors.back = cubeColors.blue
  if (x === 1) colors.right = cubeColors.red
  if (x === -1) colors.left = cubeColors.orange
  return colors
}

function faceletColorToHex(color: FaceletColor): string {
  return COLOR_MAP[color]
}

function getColorsFromPattern(
  x: number,
  y: number,
  z: number,
  facelets: Record<string, FaceletColor[]>,
): CubieProps['colors'] {
  const colors: CubieProps['colors'] = {}

  const posToFaceletIndex = (row: number, col: number): number => {
    return row * 3 + col
  }

  if (y === 1) {
    const row = z === 1 ? 2 : z === 0 ? 1 : 0
    const col = x === -1 ? 0 : x === 0 ? 1 : 2
    const idx = posToFaceletIndex(row, col)
    colors.top = faceletColorToHex(facelets.U[idx])
  }

  if (y === -1) {
    const row = z === 1 ? 0 : z === 0 ? 1 : 2
    const col = x === -1 ? 0 : x === 0 ? 1 : 2
    const idx = posToFaceletIndex(row, col)
    colors.bottom = faceletColorToHex(facelets.D[idx])
  }

  if (z === 1) {
    const row = y === 1 ? 0 : y === 0 ? 1 : 2
    const col = x === -1 ? 0 : x === 0 ? 1 : 2
    const idx = posToFaceletIndex(row, col)
    colors.front = faceletColorToHex(facelets.F[idx])
  }

  if (z === -1) {
    const row = y === 1 ? 0 : y === 0 ? 1 : 2
    const col = x === 1 ? 0 : x === 0 ? 1 : 2
    const idx = posToFaceletIndex(row, col)
    colors.back = faceletColorToHex(facelets.B[idx])
  }

  if (x === 1) {
    const row = y === 1 ? 0 : y === 0 ? 1 : 2
    const col = z === 1 ? 0 : z === 0 ? 1 : 2
    const idx = posToFaceletIndex(row, col)
    colors.right = faceletColorToHex(facelets.R[idx])
  }

  if (x === -1) {
    const row = y === 1 ? 0 : y === 0 ? 1 : 2
    const col = z === -1 ? 0 : z === 0 ? 1 : 2
    const idx = posToFaceletIndex(row, col)
    colors.left = faceletColorToHex(facelets.L[idx])
  }

  return colors
}

export interface RubiksCubeRef {
  performMove: (move: string) => void
  reset: () => void
}

interface RubiksCubeProps {
  quaternionRef?: React.MutableRefObject<THREE.Quaternion>
  pattern?: KPattern | null
  facelets?: string
  materialConfig?: SceneConfig['material']
  animationSpeed?: number
  cubeColors?: CubeColors
}

export const RubiksCube = memo(
  forwardRef<RubiksCubeRef, RubiksCubeProps>(
    (
      {
        quaternionRef,
        pattern,
        facelets: faceletsProp,
        materialConfig,
        animationSpeed = 15,
        cubeColors = DEFAULT_CUBE_COLORS,
      },
      ref,
    ) => {
      const config = materialConfig ?? DEFAULT_CONFIG.material
      const groupRef = useRef<THREE.Group>(null)
      const animationQueue = useRef<{ axis: 'x' | 'y' | 'z'; layer: number; angle: number }[]>([])
      const currentAnimation = useRef<{
        axis: 'x' | 'y' | 'z'
        layer: number
        targetAngle: number
        currentAngle: number
        cubies: THREE.Object3D[]
      } | null>(null)

      useFrame((_, delta) => {
        if (groupRef.current && quaternionRef?.current) {
          groupRef.current.quaternion.slerp(quaternionRef.current, 15 * delta)
        }
      })

      useImperativeHandle(ref, () => ({
        performMove: (move: string) => {
          const cleanMove = move.trim()
          const moveMap: Record<string, { axis: 'x' | 'y' | 'z'; layer: number; angle: number }> = {
            U: { axis: 'y', layer: 1, angle: -Math.PI / 2 },
            "U'": { axis: 'y', layer: 1, angle: Math.PI / 2 },
            U2: { axis: 'y', layer: 1, angle: -Math.PI },
            "U2'": { axis: 'y', layer: 1, angle: Math.PI },
            D: { axis: 'y', layer: -1, angle: Math.PI / 2 },
            "D'": { axis: 'y', layer: -1, angle: -Math.PI / 2 },
            D2: { axis: 'y', layer: -1, angle: Math.PI },
            "D2'": { axis: 'y', layer: -1, angle: -Math.PI },
            L: { axis: 'x', layer: -1, angle: Math.PI / 2 },
            "L'": { axis: 'x', layer: -1, angle: -Math.PI / 2 },
            L2: { axis: 'x', layer: -1, angle: Math.PI },
            "L2'": { axis: 'x', layer: -1, angle: -Math.PI },
            R: { axis: 'x', layer: 1, angle: -Math.PI / 2 },
            "R'": { axis: 'x', layer: 1, angle: Math.PI / 2 },
            R2: { axis: 'x', layer: 1, angle: -Math.PI },
            "R2'": { axis: 'x', layer: 1, angle: Math.PI },
            F: { axis: 'z', layer: 1, angle: -Math.PI / 2 },
            "F'": { axis: 'z', layer: 1, angle: Math.PI / 2 },
            F2: { axis: 'z', layer: 1, angle: -Math.PI },
            "F2'": { axis: 'z', layer: 1, angle: Math.PI },
            B: { axis: 'z', layer: -1, angle: Math.PI / 2 },
            "B'": { axis: 'z', layer: -1, angle: -Math.PI / 2 },
            B2: { axis: 'z', layer: -1, angle: Math.PI },
            "B2'": { axis: 'z', layer: -1, angle: -Math.PI },
          }

          if (moveMap[cleanMove]) {
            animationQueue.current.push(moveMap[cleanMove])
          }
        },
        reset: () => {
          animationQueue.current = []
          currentAnimation.current = null

          if (groupRef.current) {
            let idx = 0
            for (let x = -1; x <= 1; x++) {
              for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                  if (x === 0 && y === 0 && z === 0) continue
                  const child = groupRef.current.children[idx]
                  if (child) {
                    child.position.set(x * OFFSET, y * OFFSET, z * OFFSET)
                    child.quaternion.identity()
                    child.updateMatrix()
                  }
                  idx++
                }
              }
            }
          }
        },
      }))

      useFrame((_, delta) => {
        if (!groupRef.current) return

        if (!currentAnimation.current && animationQueue.current.length > 0) {
          const nextMove = animationQueue.current.shift()!
          const targetCubies: THREE.Object3D[] = []

          groupRef.current.children.forEach((child) => {
            const x = child.position.x / OFFSET
            const y = child.position.y / OFFSET
            const z = child.position.z / OFFSET

            if (nextMove.axis === 'x' && Math.abs(x - nextMove.layer) < 0.1)
              targetCubies.push(child)
            if (nextMove.axis === 'y' && Math.abs(y - nextMove.layer) < 0.1)
              targetCubies.push(child)
            if (nextMove.axis === 'z' && Math.abs(z - nextMove.layer) < 0.1)
              targetCubies.push(child)
          })

          currentAnimation.current = {
            ...nextMove,
            currentAngle: 0,
            targetAngle: nextMove.angle,
            cubies: targetCubies,
          }
        }

        if (currentAnimation.current) {
          const anim = currentAnimation.current
          const speed = animationSpeed
          const step = anim.targetAngle > 0 ? speed * delta : -speed * delta

          let finished = false
          let rotationStep = step

          if (
            (anim.targetAngle > 0 && anim.currentAngle + step >= anim.targetAngle) ||
            (anim.targetAngle < 0 && anim.currentAngle + step <= anim.targetAngle)
          ) {
            rotationStep = anim.targetAngle - anim.currentAngle
            finished = true
          }

          const axisVector = new THREE.Vector3(
            anim.axis === 'x' ? 1 : 0,
            anim.axis === 'y' ? 1 : 0,
            anim.axis === 'z' ? 1 : 0,
          )

          const rotQuat = new THREE.Quaternion().setFromAxisAngle(axisVector, rotationStep)

          anim.cubies.forEach((cubie) => {
            cubie.position.applyAxisAngle(axisVector, rotationStep)
            cubie.quaternion.premultiply(rotQuat)
          })

          anim.currentAngle += rotationStep

          if (finished) {
            anim.cubies.forEach((cubie) => {
              cubie.position.x = Math.round(cubie.position.x / OFFSET) * OFFSET
              cubie.position.y = Math.round(cubie.position.y / OFFSET) * OFFSET
              cubie.position.z = Math.round(cubie.position.z / OFFSET) * OFFSET
              cubie.updateMatrix()
            })
            currentAnimation.current = null
          }
        }
      })

      const facelets = useMemo(() => {
        if (faceletsProp) {
          return patternToFacelets(null as unknown as KPattern, faceletsProp)
        }
        if (pattern) {
          return patternToFacelets(pattern)
        }
        return null
      }, [pattern, faceletsProp])

      const cubies = useMemo(() => {
        const result: {
          key: string
          position: [number, number, number]
          colors: CubieProps['colors']
          pieceType: PieceType
          coords: { x: number; y: number; z: number }
        }[] = []

        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
              if (x === 0 && y === 0 && z === 0) continue

              const colors = facelets
                ? getColorsFromPattern(x, y, z, facelets)
                : getDefaultColors(x, y, z, cubeColors)

              result.push({
                key: `${x},${y},${z}`,
                position: [x * OFFSET, y * OFFSET, z * OFFSET],
                colors,
                pieceType: getPieceType(x, y, z),
                coords: { x, y, z },
              })
            }
          }
        }

        return result
      }, [facelets, cubeColors])

      return (
        <group ref={groupRef}>
          {cubies.map((cubie) => (
            <Cubie
              key={cubie.key}
              position={cubie.position}
              colors={cubie.colors}
              pieceType={cubie.pieceType}
              coords={cubie.coords}
              materialConfig={config}
            />
          ))}
        </group>
      )
    },
  ),
)
