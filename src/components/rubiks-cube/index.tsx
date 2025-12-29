import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { RubiksCube } from './RubiksCube'

interface RubiksCubeViewerProps {
  className?: string
}

export function RubiksCubeViewer({ className }: RubiksCubeViewerProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [4, 3, 4], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        <RubiksCube />
        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={12}
          enableDamping
          dampingFactor={0.05}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  )
}
