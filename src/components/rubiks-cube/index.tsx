import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { RubiksCube, type RubiksCubeRef } from './RubiksCube'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'

interface RubiksCubeViewerProps {
  className?: string
}

export function RubiksCubeViewer({ className }: RubiksCubeViewerProps) {
  const cubeRef = useRef<RubiksCubeRef>(null)

  const handleMove = (move: string) => {
    cubeRef.current?.performMove(move)
  }

  const moves = [
    ['L', "L'"], ['R', "R'"],
    ['U', "U'"], ['D', "D'"],
    ['F', "F'"], ['B', "B'"]
  ]

  return (
    <div className={className}>
      <div className="relative h-full w-full">
        <Canvas camera={{ position: [4, 3, 4], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          <RubiksCube ref={cubeRef} />
          <OrbitControls
            enablePan={false}
            minDistance={5}
            maxDistance={12}
            enableDamping
            dampingFactor={0.05}
          />
          <Environment preset="studio" />
        </Canvas>

        {/* Controls Overlay */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 rounded-lg bg-background/80 p-4 backdrop-blur">
          <div className="grid grid-cols-2 gap-2">
            {moves.map(([m1, m2]) => (
              <div key={m1} className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-8 font-mono"
                  onClick={() => handleMove(m1)}
                >
                  {m1}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-8 font-mono"
                  onClick={() => handleMove(m2)}
                >
                  {m2}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
