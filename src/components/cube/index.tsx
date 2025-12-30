import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { RubiksCube, type RubiksCubeRef, type CubeColors } from './RubiksCube'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import type { KPattern } from 'cubing/kpuzzle'
import { type SceneConfig, DEFAULT_CONFIG } from '@/config/scene-config'

function CameraController({ config }: { config: SceneConfig }) {
  const { camera } = useThree()

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = config.camera.fov
      camera.updateProjectionMatrix()
    }
  }, [camera, config.camera.fov])

  return null
}

interface CubeViewerProps {
  pattern?: KPattern | null
  facelets?: string
  quaternionRef?: React.MutableRefObject<THREE.Quaternion>
  cubeRef?: React.RefObject<RubiksCubeRef | null>
  config?: SceneConfig
  animationSpeed?: number
  cubeColors?: CubeColors
}

export function CubeViewer({
  pattern,
  facelets,
  quaternionRef,
  cubeRef,
  config = DEFAULT_CONFIG,
  animationSpeed,
  cubeColors,
}: CubeViewerProps) {
  const internalRef = useRef<RubiksCubeRef>(null)
  const ref = cubeRef || internalRef

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: config.camera.position, fov: config.camera.fov }}>
        <CameraController config={config} />
        <ambientLight intensity={config.light.ambient.intensity} />
        <directionalLight
          position={config.light.directional1.position}
          intensity={config.light.directional1.intensity}
        />
        <directionalLight
          position={config.light.directional2.position}
          intensity={config.light.directional2.intensity}
        />
        <group scale={config.cube.scale}>
          <RubiksCube
            ref={ref}
            quaternionRef={quaternionRef}
            pattern={pattern}
            facelets={facelets}
            materialConfig={config.material}
            animationSpeed={animationSpeed}
            cubeColors={cubeColors}
          />
        </group>
        <OrbitControls
          enablePan={false}
          minDistance={config.camera.minDistance}
          maxDistance={config.camera.maxDistance}
          enableDamping
          dampingFactor={0.05}
        />
        <Environment preset={config.environment.preset} />
      </Canvas>
    </div>
  )
}

export { type RubiksCubeRef, type CubeColors }
