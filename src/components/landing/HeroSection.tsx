import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { RubiksCube, type RubiksCubeRef } from '@/components/cube/RubiksCube'
import * as THREE from 'three'
import type { SceneConfig } from '@/config/scene-config'

const HERO_CUBE_CONFIG: SceneConfig = {
  light: {
    ambient: { intensity: 0.3 },
    directional1: { position: [10, 10, 5], intensity: 1.0 },
    directional2: { position: [-10, -10, -5], intensity: 0.3 },
  },
  material: {
    face: {
      roughness: 0.25,
      metalness: 0.28,
      clearcoat: 0.3,
      clearcoatRoughness: 0.1,
      reflectivity: 0.2,
    },
    inner: { roughness: 0.6, metalness: 0.4 },
  },
  camera: {
    position: [4.5, 3.5, 4.5],
    fov: 40,
    minDistance: 5,
    maxDistance: 12,
  },
  cube: { scale: 0.85, cubeSize: 0.95, gap: 0 },
  environment: { preset: 'sunset' },
}

const PLL_ALGORITHMS = [
  ["R", "U", "R'", "U'", "R'", "F", "R2", "U'", "R'", "U'", "R", "U", "R'", "F'"],
  ["M2", "U", "M2", "U2", "M2", "U", "M2"],
  ["R2", "U", "R", "U", "R'", "U'", "R'", "U'", "R'", "U", "R'"],
]

function CameraController() {
  const { camera } = useThree()

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = HERO_CUBE_CONFIG.camera.fov
      camera.updateProjectionMatrix()
    }
  }, [camera])

  return null
}

function HeroCubeScene({ cubeRef }: { cubeRef: React.RefObject<RubiksCubeRef | null> }) {
  return (
    <>
      <CameraController />
      <ambientLight intensity={HERO_CUBE_CONFIG.light.ambient.intensity} />
      <directionalLight
        position={HERO_CUBE_CONFIG.light.directional1.position}
        intensity={HERO_CUBE_CONFIG.light.directional1.intensity}
      />
      <directionalLight
        position={HERO_CUBE_CONFIG.light.directional2.position}
        intensity={HERO_CUBE_CONFIG.light.directional2.intensity}
      />
      <group scale={HERO_CUBE_CONFIG.cube.scale} rotation={[-0.3, 0, 0]}>
        <RubiksCube
          ref={cubeRef}
          materialConfig={HERO_CUBE_CONFIG.material}
          animationSpeed={10}
        />
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={1.5}
      />
      <Environment preset={HERO_CUBE_CONFIG.environment.preset} />
    </>
  )
}

function HeroCube() {
  const cubeRef = useRef<RubiksCubeRef>(null)
  const [currentAlgIndex, setCurrentAlgIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const performAlgorithm = useCallback(async (moves: string[], reverse = false) => {
    if (!cubeRef.current) return

    const movesToDo = reverse ? [...moves].reverse().map(m => {
      if (m.endsWith("'")) return m.slice(0, -1)
      if (m.endsWith("2") || m.endsWith("3")) return m
      return m + "'"
    }) : moves

    for (const move of movesToDo) {
      if (move.endsWith("2")) {
        cubeRef.current.performMove(move.slice(0, -1))
        await new Promise(r => setTimeout(r, 150))
        cubeRef.current.performMove(move.slice(0, -1))
      } else {
        cubeRef.current.performMove(move)
      }
      await new Promise(r => setTimeout(r, 150))
    }
  }, [])

  useEffect(() => {
    const runPLLCycle = async () => {
      if (isAnimating || !cubeRef.current) return

      setIsAnimating(true)

      try {
        const alg = PLL_ALGORITHMS[currentAlgIndex]
        await performAlgorithm(alg)
        await new Promise(resolve => setTimeout(resolve, 600))
        await performAlgorithm(alg, true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setCurrentAlgIndex(prev => (prev + 1) % PLL_ALGORITHMS.length)
      } catch {
        // Silently handle errors
      } finally {
        setIsAnimating(false)
      }
    }

    const timer = setTimeout(runPLLCycle, 2500)
    return () => clearTimeout(timer)
  }, [currentAlgIndex, isAnimating, performAlgorithm])

  return (
    <div className="relative h-full w-full" style={{ minHeight: '350px' }}>
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--theme-accent) 0%, transparent 70%)',
          opacity: 0.3,
        }}
      />
      <Canvas camera={{ position: HERO_CUBE_CONFIG.camera.position, fov: HERO_CUBE_CONFIG.camera.fov }}>
        <HeroCubeScene cubeRef={cubeRef} />
      </Canvas>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:py-32">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 md:flex-row md:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-xl text-center md:text-left"
        >
          <h1
            className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            style={{ color: 'var(--theme-text)' }}
          >
            Built by a cuber,{' '}
            <span style={{ color: 'var(--theme-accent)' }}>for cubers.</span>
          </h1>

          <p
            className="mb-8 text-lg md:text-xl"
            style={{ color: 'var(--theme-sub)' }}
          >
            A gamified smart cube companion that makes every solve count. Track your progress, 
            earn achievements, and compete globally.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
            <Link
              to="/app"
              className="rounded-lg px-8 py-3 text-lg font-medium transition-all hover:scale-105 hover:opacity-90"
              style={{
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-bg)',
              }}
            >
              Start Solving →
            </Link>

            <a
              href="https://discord.gg/XPQr4wpQVg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border px-8 py-3 text-lg font-medium transition-all hover:opacity-80"
              style={{
                borderColor: 'var(--theme-sub-alt)',
                color: 'var(--theme-text)',
              }}
            >
              <MessageCircle className="h-5 w-5" />
              Join Discord
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative h-72 w-72 md:h-96 md:w-96 lg:h-[28rem] lg:w-[28rem]"
        >
          <HeroCube />
        </motion.div>
      </div>
    </section>
  )
}
