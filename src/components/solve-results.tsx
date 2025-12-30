import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  RotateCcw,
  BarChart3,
  Play,
  Pause,
  ArrowLeft,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import * as THREE from 'three'
import { CubeViewer, type RubiksCubeRef } from '@/components/cube'
import { DEFAULT_CONFIG } from '@/config/scene-config'
import { createSolvedCube, applyMove, cubeFacesToFacelets, COLOR_HEX } from '@/lib/cube-faces'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatTime, formatDuration } from '@/lib/format'
import type { CFOPAnalysis, CFOPPhase } from '@/lib/cfop-analyzer'
import type { KPattern } from 'cubing/kpuzzle'
import type { MutableRefObject } from 'react'
import type { Quaternion } from 'three'
import type { Solve } from '@/types'

interface SolveResultsProps {
  time: number
  moves: number
  analysis: CFOPAnalysis | null
  onNextScramble?: () => void
  onRepeatScramble?: () => void
  onViewStats?: () => void
  onWatchReplay?: () => void
  onBack?: () => void
  pattern?: KPattern | null
  quaternionRef?: MutableRefObject<Quaternion>
  cubeRef?: MutableRefObject<RubiksCubeRef | null>
  scramble?: string
  showBackButton?: boolean
  solve?: Solve
}

interface PhaseMarker {
  name: string
  startIndex: number
  endIndex: number
  color: string
  widthPercent: number
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-start"
    >
      <span className="text-sm tracking-wide" style={{ color: 'var(--theme-sub)' }}>
        {label}
      </span>
      <span className="text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>
        {value}
      </span>
    </motion.div>
  )
}

function PhaseStatCard({
  label,
  moves,
  duration,
  tps,
}: {
  label: string
  moves: number
  duration: number
  tps: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-start"
    >
      <span className="text-sm tracking-wide" style={{ color: 'var(--theme-sub)' }}>
        {label}
      </span>
      {moves > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="cursor-pointer text-3xl font-bold transition-colors hover:text-[var(--theme-accent)]"
              style={{ color: 'var(--theme-text)' }}
            >
              {formatDuration(duration)}
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="border-[var(--theme-subAlt)] bg-[var(--theme-bgSecondary)]"
          >
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between gap-4">
                <span style={{ color: 'var(--theme-sub)' }}>TPS</span>
                <span className="font-medium" style={{ color: 'var(--theme-text)' }}>
                  {tps.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span style={{ color: 'var(--theme-sub)' }}>Moves</span>
                <span className="font-medium" style={{ color: 'var(--theme-text)' }}>
                  {moves}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span style={{ color: 'var(--theme-sub)' }}>Duration</span>
                <span className="font-medium" style={{ color: 'var(--theme-text)' }}>
                  {formatDuration(duration)}
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span className="text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>
          {formatDuration(duration)}
        </span>
      )}
    </motion.div>
  )
}

function ActionButton({
  icon: Icon,
  onClick,
  label,
  hidden,
  active,
}: {
  icon: typeof ChevronRight
  onClick?: () => void
  label: string
  hidden?: boolean
  active?: boolean
}) {
  if (hidden || !onClick) return null
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-lg transition-colors"
      style={{
        backgroundColor: active ? 'var(--theme-accent)' : 'var(--theme-subAlt)',
        color: active ? 'var(--theme-bg)' : 'var(--theme-text)',
      }}
      title={label}
    >
      <Icon className="h-5 w-5" />
    </motion.button>
  )
}

function CubeNet({ scramble }: { scramble: string }) {
  const cubeState = useMemo(() => {
    const moves = scramble
      .trim()
      .split(/\s+/)
      .filter((m) => m.length > 0)
    let cube = createSolvedCube()
    for (const move of moves) {
      cube = applyMove(cube, move)
    }
    return cube
  }, [scramble])

  return (
    <div
      className="grid grid-cols-3 gap-1 rounded-lg p-2"
      style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
    >
      {cubeState.F.map((color, i) => (
        <div
          key={i}
          className="h-12 w-12 rounded"
          style={{
            backgroundColor: COLOR_HEX[color as keyof typeof COLOR_HEX] || '#888',
          }}
        />
      ))}
    </div>
  )
}

interface PhaseBarProps {
  label: string
  moves: number
  recognitionRatio: number
  maxMoves: number
  totalTime: number
  phaseColor: string
}

function VerticalBar({
  label,
  moves,
  recognitionRatio,
  maxMoves,
  totalTime,
  phaseColor,
}: PhaseBarProps) {
  const barHeight = maxMoves > 0 ? (moves / maxMoves) * 100 : 0
  const recognitionHeight = recognitionRatio * 100
  const executionRatio = 1 - recognitionRatio

  const phaseTime = (moves / maxMoves) * totalTime * 0.25
  const recognitionTime = phaseTime * recognitionRatio
  const executionTime = phaseTime * executionRatio

  const formatMs = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const barContent = (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div
        className="relative w-full cursor-pointer overflow-hidden rounded-t transition-opacity hover:opacity-100"
        style={{ height: '120px', opacity: 0.9 }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 flex flex-col overflow-hidden rounded-t"
          style={{ height: `${Math.max(barHeight, 5)}%` }}
        >
          <div
            className="w-full"
            style={{
              height: `${recognitionHeight}%`,
              backgroundColor: phaseColor,
              opacity: 0.4,
            }}
          />
          <div
            className="w-full flex-1"
            style={{
              backgroundColor: phaseColor,
              opacity: 0.9,
            }}
          />
        </div>
      </div>
      <span className="text-xs" style={{ color: phaseColor }}>
        {label}
      </span>
    </div>
  )

  if (moves === 0) {
    return <div className="flex flex-1 flex-col items-center gap-2">{barContent}</div>
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{barContent}</TooltipTrigger>
      <TooltipContent
        side="top"
        className="border-[var(--theme-subAlt)] bg-[var(--theme-bgSecondary)]"
      >
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="font-medium" style={{ color: phaseColor }}>
            {label}: {moves} moves
          </div>
          <div className="flex items-center gap-2" style={{ color: 'var(--theme-sub)' }}>
            <div
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: phaseColor, opacity: 0.4 }}
            />
            <span>Recognition: {Math.round(recognitionRatio * 100)}%</span>
            <span style={{ color: 'var(--theme-text)' }}>{formatMs(recognitionTime)}</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: 'var(--theme-sub)' }}>
            <div
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: phaseColor, opacity: 0.9 }}
            />
            <span>Execution: {Math.round(executionRatio * 100)}%</span>
            <span style={{ color: 'var(--theme-text)' }}>{formatMs(executionTime)}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function parseAlgorithm(alg: string): string[] {
  return alg
    .trim()
    .split(/\s+/)
    .filter((m) => m.length > 0)
}

export function SolveResults({
  time,
  moves,
  analysis,
  onNextScramble,
  onRepeatScramble,
  onViewStats,
  onWatchReplay,
  onBack,
  pattern,
  quaternionRef,
  cubeRef,
  scramble,
  showBackButton,
  solve,
}: SolveResultsProps) {
  const [isReplayMode, setIsReplayMode] = useState(false)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(500)
  const [currentElapsedTime, setCurrentElapsedTime] = useState(0)

  const hasGyroData = Boolean(solve?.gyroData && solve.gyroData.length > 0)
  const hasMoveTimings = Boolean(solve?.moveTimings && solve.moveTimings.length > 0)
  const [enableGyro, setEnableGyro] = useState(hasGyroData)

  const replayCubeRef = useRef<RubiksCubeRef>(null)
  const replayQuaternionRef = useRef<THREE.Quaternion>(new THREE.Quaternion())
  const playbackStartTimeRef = useRef<number>(0)
  const currentMoveIndexRef = useRef<number>(-1)
  const isPlayingRef = useRef<boolean>(false)
  const animationFrameRef = useRef<number | null>(null)

  const has3DCube = pattern && quaternionRef && cubeRef

  const crossMoves = analysis?.cross.moves.length ?? 0
  const f2l1Moves = analysis?.f2l[0]?.moves.length ?? 0
  const f2l2Moves = analysis?.f2l[1]?.moves.length ?? 0
  const f2l3Moves = analysis?.f2l[2]?.moves.length ?? 0
  const f2l4Moves = analysis?.f2l[3]?.moves.length ?? 0
  const f2lMoves = f2l1Moves + f2l2Moves + f2l3Moves + f2l4Moves
  const ollMoves = analysis?.oll.moves.length ?? 0
  const pllMoves = analysis?.pll.moves.length ?? 0

  const totalPhaseMoves = crossMoves + f2lMoves + ollMoves + pllMoves
  const crossDuration = totalPhaseMoves > 0 ? (crossMoves / totalPhaseMoves) * time : 0
  const f2lDuration = totalPhaseMoves > 0 ? (f2lMoves / totalPhaseMoves) * time : 0
  const ollDuration = totalPhaseMoves > 0 ? (ollMoves / totalPhaseMoves) * time : 0
  const pllDuration = totalPhaseMoves > 0 ? (pllMoves / totalPhaseMoves) * time : 0

  const crossTps = crossDuration > 0 ? crossMoves / (crossDuration / 1000) : 0
  const f2lTps = f2lDuration > 0 ? f2lMoves / (f2lDuration / 1000) : 0
  const ollTps = ollDuration > 0 ? ollMoves / (ollDuration / 1000) : 0
  const pllTps = pllDuration > 0 ? pllMoves / (pllDuration / 1000) : 0

  const maxMoves = Math.max(
    crossMoves,
    f2l1Moves,
    f2l2Moves,
    f2l3Moves,
    f2l4Moves,
    ollMoves,
    pllMoves,
    1,
  )

  const phases = [
    { label: 'Cross', moves: crossMoves, recognitionRatio: 0.15, colorVar: '--theme-phaseCross' },
    { label: 'F2L 1', moves: f2l1Moves, recognitionRatio: 0.25, colorVar: '--theme-phaseF2L1' },
    { label: 'F2L 2', moves: f2l2Moves, recognitionRatio: 0.25, colorVar: '--theme-phaseF2L2' },
    { label: 'F2L 3', moves: f2l3Moves, recognitionRatio: 0.25, colorVar: '--theme-phaseF2L3' },
    { label: 'F2L 4', moves: f2l4Moves, recognitionRatio: 0.25, colorVar: '--theme-phaseF2L4' },
    { label: 'OLL', moves: ollMoves, recognitionRatio: 0.35, colorVar: '--theme-phaseOLL' },
    { label: 'PLL', moves: pllMoves, recognitionRatio: 0.3, colorVar: '--theme-phasePLL' },
  ]

  const { initialScrambledFacelets, replayPhases, allMoves, totalMoves, timeOffset } =
    useMemo(() => {
      if (!solve) {
        return {
          initialScrambledFacelets: '',
          replayPhases: [],
          allMoves: [],
          totalMoves: 0,
          timeOffset: 0,
        }
      }

      const scrambleMoves = parseAlgorithm(solve.scramble)
      let solutionMoves = solve.solution
      const offset = solve.moveTimings?.[0]?.time ?? 0

      if (solve.cfopAnalysis) {
        const analysisMovesCount =
          solve.cfopAnalysis.cross.moves.length +
          solve.cfopAnalysis.f2l.reduce(
            (sum: number, slot: CFOPPhase) => sum + slot.moves.length,
            0,
          ) +
          solve.cfopAnalysis.oll.moves.length +
          solve.cfopAnalysis.pll.moves.length

        if (analysisMovesCount > solutionMoves.length) {
          solutionMoves = [
            ...solve.cfopAnalysis.cross.moves,
            ...solve.cfopAnalysis.f2l.flatMap((slot: CFOPPhase) => slot.moves),
            ...solve.cfopAnalysis.oll.moves,
            ...solve.cfopAnalysis.pll.moves,
          ]
        }
      }

      let cube = createSolvedCube()
      for (const move of scrambleMoves) {
        cube = applyMove(cube, move)
      }
      const scrambledFacelets = cubeFacesToFacelets(cube)

      const moveCount = solutionMoves.length
      const phaseMarkers: PhaseMarker[] = []

      if (solve.cfopAnalysis && moveCount > 0) {
        let currentIndex = 0
        const cfop = solve.cfopAnalysis

        if (cfop.cross.moves.length > 0) {
          phaseMarkers.push({
            name: 'Cross',
            startIndex: currentIndex,
            endIndex: currentIndex + cfop.cross.moves.length - 1,
            color: 'var(--theme-phaseCross)',
            widthPercent: (cfop.cross.moves.length / moveCount) * 100,
          })
          currentIndex += cfop.cross.moves.length
        }

        const f2lColors = [
          'var(--theme-phaseF2L1)',
          'var(--theme-phaseF2L2)',
          'var(--theme-phaseF2L3)',
          'var(--theme-phaseF2L4)',
        ]
        cfop.f2l.forEach((slot: CFOPPhase, i: number) => {
          if (slot.moves.length > 0) {
            phaseMarkers.push({
              name: `F2L ${i + 1}`,
              startIndex: currentIndex,
              endIndex: currentIndex + slot.moves.length - 1,
              color: f2lColors[i],
              widthPercent: (slot.moves.length / moveCount) * 100,
            })
            currentIndex += slot.moves.length
          }
        })

        if (cfop.oll.moves.length > 0) {
          phaseMarkers.push({
            name: 'OLL',
            startIndex: currentIndex,
            endIndex: currentIndex + cfop.oll.moves.length - 1,
            color: 'var(--theme-phaseOLL)',
            widthPercent: (cfop.oll.moves.length / moveCount) * 100,
          })
          currentIndex += cfop.oll.moves.length
        }

        if (cfop.pll.moves.length > 0) {
          phaseMarkers.push({
            name: 'PLL',
            startIndex: currentIndex,
            endIndex: currentIndex + cfop.pll.moves.length - 1,
            color: 'var(--theme-phasePLL)',
            widthPercent: (cfop.pll.moves.length / moveCount) * 100,
          })
        }
      }

      return {
        initialScrambledFacelets: scrambledFacelets,
        replayPhases: phaseMarkers,
        allMoves: solutionMoves,
        totalMoves: solutionMoves.length,
        timeOffset: offset,
      }
    }, [solve])

  const [replayKey, setReplayKey] = useState(0)

  useEffect(() => {
    currentMoveIndexRef.current = currentMoveIndex
  }, [currentMoveIndex])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    if (!isPlaying || !solve) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    playbackStartTimeRef.current = performance.now()
    const startMoveIndex = currentMoveIndexRef.current

    if (hasMoveTimings && solve.moveTimings && solve.moveTimings.length > 0) {
      const firstMoveTime = solve.moveTimings[0]?.time || 0
      const startTime =
        startMoveIndex >= 0 && startMoveIndex < solve.moveTimings.length
          ? solve.moveTimings[startMoveIndex].time
          : firstMoveTime
      const speedMultiplier = 500 / playbackSpeed

      const animate = () => {
        if (!isPlayingRef.current) return

        const elapsed =
          (performance.now() - playbackStartTimeRef.current) * speedMultiplier + startTime
        setCurrentElapsedTime(elapsed)

        if (enableGyro && hasGyroData && solve.gyroData && solve.gyroData.length > 0) {
          let gyroFrame = solve.gyroData[0]
          for (let i = solve.gyroData.length - 1; i >= 0; i--) {
            if (solve.gyroData[i].time <= elapsed) {
              gyroFrame = solve.gyroData[i]
              break
            }
          }
          replayQuaternionRef.current.set(
            gyroFrame.quaternion.x,
            gyroFrame.quaternion.y,
            gyroFrame.quaternion.z,
            gyroFrame.quaternion.w,
          )
        }

        let targetMoveIdx = -1
        for (let i = 0; i < solve.moveTimings!.length; i++) {
          if (solve.moveTimings![i].time <= elapsed) {
            targetMoveIdx = i
          } else {
            break
          }
        }

        if (targetMoveIdx !== currentMoveIndexRef.current && targetMoveIdx >= 0) {
          const prevIdx = currentMoveIndexRef.current
          currentMoveIndexRef.current = targetMoveIdx
          setCurrentMoveIndex(targetMoveIdx)

          if (replayCubeRef.current && targetMoveIdx > prevIdx) {
            for (let i = prevIdx + 1; i <= targetMoveIdx; i++) {
              if (i >= 0 && i < allMoves.length) {
                replayCubeRef.current.performMove(allMoves[i])
              }
            }
          }
        }

        if (targetMoveIdx >= totalMoves - 1) {
          setIsPlaying(false)
          return
        }

        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      const interval = setInterval(() => {
        const prev = currentMoveIndexRef.current
        if (prev >= totalMoves - 1) {
          setIsPlaying(false)
          return
        }
        const next = prev + 1
        currentMoveIndexRef.current = next
        setCurrentMoveIndex(next)

        if (replayCubeRef.current && next >= 0 && next < allMoves.length) {
          replayCubeRef.current.performMove(allMoves[next])
        }
      }, playbackSpeed)

      return () => clearInterval(interval)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [
    isPlaying,
    totalMoves,
    playbackSpeed,
    hasMoveTimings,
    hasGyroData,
    enableGyro,
    solve,
    allMoves,
  ])

  const handleSeek = useCallback(
    (index: number) => {
      const newIndex = Math.max(-1, Math.min(index, totalMoves - 1))
      const prevIndex = currentMoveIndexRef.current
      currentMoveIndexRef.current = newIndex
      setCurrentMoveIndex(newIndex)

      if (newIndex < prevIndex) {
        setReplayKey((k) => k + 1)
        setTimeout(() => {
          if (replayCubeRef.current) {
            for (let i = 0; i <= newIndex; i++) {
              if (i >= 0 && i < allMoves.length) {
                replayCubeRef.current.performMove(allMoves[i])
              }
            }
          }
        }, 50)
      } else if (newIndex > prevIndex && replayCubeRef.current) {
        for (let i = prevIndex + 1; i <= newIndex; i++) {
          if (i >= 0 && i < allMoves.length) {
            replayCubeRef.current.performMove(allMoves[i])
          }
        }
      }

      if (solve?.moveTimings && solve.moveTimings.length > 0) {
        const elapsed =
          newIndex >= 0 && newIndex < solve.moveTimings.length
            ? solve.moveTimings[newIndex].time
            : (solve.moveTimings[0]?.time ?? 0)
        setCurrentElapsedTime(elapsed)

        if (enableGyro && solve.gyroData && solve.gyroData.length > 0) {
          let gyroFrame = solve.gyroData[0]
          for (let i = solve.gyroData.length - 1; i >= 0; i--) {
            if (solve.gyroData[i].time <= elapsed) {
              gyroFrame = solve.gyroData[i]
              break
            }
          }
          replayQuaternionRef.current.set(
            gyroFrame.quaternion.x,
            gyroFrame.quaternion.y,
            gyroFrame.quaternion.z,
            gyroFrame.quaternion.w,
          )
        }
      } else {
        const estimatedTime = totalMoves > 0 ? ((newIndex + 1) / totalMoves) * time : 0
        setCurrentElapsedTime(Math.max(0, estimatedTime))
      }
    },
    [totalMoves, solve, enableGyro, time, allMoves],
  )

  const togglePlay = () => {
    if (!isPlaying) {
      playbackStartTimeRef.current = performance.now()
    }
    setIsPlaying(!isPlaying)
  }

  const stepBack = () => handleSeek(currentMoveIndex - 1)
  const stepForward = () => handleSeek(currentMoveIndex + 1)

  const resetReplay = () => {
    currentMoveIndexRef.current = -1
    setCurrentMoveIndex(-1)
    setCurrentElapsedTime(0)
    setIsPlaying(false)
    setReplayKey((k) => k + 1)
    if (solve?.gyroData?.[0]) {
      const firstFrame = solve.gyroData[0]
      replayQuaternionRef.current.set(
        firstFrame.quaternion.x,
        firstFrame.quaternion.y,
        firstFrame.quaternion.z,
        firstFrame.quaternion.w,
      )
    }
  }

  const enterReplayMode = () => {
    setIsReplayMode(true)
    setCurrentMoveIndex(-1)
    setCurrentElapsedTime(0)
    setIsPlaying(false)
    setReplayKey((k) => k + 1)
    if (solve?.gyroData?.[0]) {
      const firstFrame = solve.gyroData[0]
      replayQuaternionRef.current.set(
        firstFrame.quaternion.x,
        firstFrame.quaternion.y,
        firstFrame.quaternion.z,
        firstFrame.quaternion.w,
      )
    }
  }

  const exitReplayMode = () => {
    setIsReplayMode(false)
    setIsPlaying(false)
    setCurrentMoveIndex(-1)
    setCurrentElapsedTime(0)
  }

  const getCurrentPhase = () => {
    if (currentMoveIndex < 0) return null
    return replayPhases.find(
      (p) => currentMoveIndex >= p.startIndex && currentMoveIndex <= p.endIndex,
    )
  }

  const currentPhase = getCurrentPhase()
  const progressPercent = totalMoves > 0 ? ((currentMoveIndex + 1) / totalMoves) * 100 : 0

  const canReplay =
    solve && (solve.gyroData?.length || solve.moveTimings?.length || solve.solution?.length)

  const displayTime = isReplayMode ? Math.max(0, currentElapsedTime - timeOffset) : time
  const currentMoveCount = isReplayMode ? Math.max(0, currentMoveIndex + 1) : moves
  const displayTps = displayTime > 0 ? (currentMoveCount / (displayTime / 1000)).toFixed(2) : '0.00'

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-full w-full flex-col">
        {showBackButton && onBack && (
          <div
            className="flex items-center gap-4 px-6 py-4"
            style={{ borderBottom: '1px solid var(--theme-subAlt)' }}
          >
            <button
              onClick={onBack}
              className="rounded-lg p-2 transition-colors hover:opacity-80"
              style={{ color: 'var(--theme-sub)' }}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm" style={{ color: 'var(--theme-sub)' }}>
              Back to Solve History
            </span>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-1 flex-col items-center justify-center gap-3 px-4"
        >
          <div className="flex w-full max-w-4xl items-start justify-center gap-8">
            <div className="flex flex-col gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-base" style={{ color: 'var(--theme-sub)' }}>
                  time
                </span>
                <div
                  className="text-6xl font-bold tabular-nums"
                  style={{ color: 'var(--theme-accent)' }}
                >
                  {formatTime(displayTime)}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-base" style={{ color: 'var(--theme-sub)' }}>
                  tps
                </span>
                <div
                  className="text-4xl font-bold tabular-nums"
                  style={{ color: 'var(--theme-text)' }}
                >
                  {displayTps}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative flex items-center justify-center"
              style={{ minWidth: 224, minHeight: 224 }}
            >
              {isReplayMode && initialScrambledFacelets ? (
                <div className="flex h-56 w-56 items-center justify-center">
                  <CubeViewer
                    key={replayKey}
                    facelets={initialScrambledFacelets}
                    quaternionRef={enableGyro && hasGyroData ? replayQuaternionRef : undefined}
                    cubeRef={replayCubeRef}
                    config={{
                      ...DEFAULT_CONFIG,
                      camera: {
                        ...DEFAULT_CONFIG.camera,
                        fov: 26,
                      },
                    }}
                    animationSpeed={30}
                  />
                </div>
              ) : has3DCube ? (
                <div className="flex h-56 w-56 items-center justify-center">
                  <CubeViewer
                    pattern={pattern}
                    quaternionRef={quaternionRef}
                    cubeRef={cubeRef}
                    config={{
                      ...DEFAULT_CONFIG,
                      camera: {
                        ...DEFAULT_CONFIG.camera,
                        fov: 26,
                      },
                    }}
                    animationSpeed={200}
                  />
                </div>
              ) : scramble ? (
                <CubeNet scramble={scramble} />
              ) : null}
            </motion.div>

            {analysis && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-1 flex-col gap-2"
                style={{ maxWidth: '400px' }}
              >
                <div className="mb-1 flex items-center justify-end">
                  <div
                    className="flex items-center gap-3 text-xs"
                    style={{ color: 'var(--theme-sub)' }}
                  >
                    <div className="flex items-center gap-1">
                      <div
                        className="h-2 w-4 rounded-sm opacity-40"
                        style={{ backgroundColor: 'var(--theme-text)' }}
                      />
                      <span>rec</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="h-2 w-4 rounded-sm opacity-90"
                        style={{ backgroundColor: 'var(--theme-text)' }}
                      />
                      <span>exec</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex w-full gap-1">
                  {phases.map((phase) => (
                    <VerticalBar
                      key={phase.label}
                      label={phase.label}
                      moves={phase.moves}
                      recognitionRatio={phase.recognitionRatio}
                      maxMoves={maxMoves}
                      totalTime={time}
                      phaseColor={`var(${phase.colorVar})`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isReplayMode ? (
              <motion.div
                key="replay"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex w-full max-w-4xl flex-col gap-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentPhase && (
                      <span
                        className="rounded-full px-3 py-1 text-sm font-medium text-white"
                        style={{ backgroundColor: currentPhase.color }}
                      >
                        {currentPhase.name}
                      </span>
                    )}
                    <span className="text-sm" style={{ color: 'var(--theme-sub)' }}>
                      {currentMoveIndex < 0
                        ? 'Scrambled'
                        : currentMoveIndex >= totalMoves - 1
                          ? 'Solved'
                          : `Move ${currentMoveIndex + 1} of ${totalMoves}`}
                    </span>
                    {currentMoveIndex >= 0 && currentMoveIndex < totalMoves && (
                      <span
                        className="font-mono text-lg font-bold"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {allMoves[currentMoveIndex]}
                      </span>
                    )}
                  </div>

                  {hasGyroData && (
                    <label
                      className="flex items-center gap-2 text-xs"
                      style={{ color: 'var(--theme-sub)' }}
                    >
                      <input
                        type="checkbox"
                        checked={enableGyro}
                        onChange={(e) => setEnableGyro(e.target.checked)}
                        className="h-3 w-3 rounded"
                        style={{ accentColor: 'var(--theme-accent)' }}
                      />
                      Gyroscope
                    </label>
                  )}
                </div>

                <div className="relative flex h-2 w-full items-center gap-1">
                  {replayPhases.map((phase) => (
                    <div
                      key={phase.name}
                      className="relative h-full cursor-pointer rounded-full transition-opacity hover:opacity-80"
                      style={{
                        width: `${phase.widthPercent}%`,
                        backgroundColor: phase.color,
                      }}
                      onClick={() => handleSeek(phase.startIndex)}
                      title={phase.name}
                    />
                  ))}

                  <div
                    className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-white shadow-lg transition-all"
                    style={{
                      left: `${progressPercent}%`,
                      transform: `translateX(-50%) translateY(-50%)`,
                    }}
                  />

                  <input
                    type="range"
                    min={-1}
                    max={totalMoves - 1}
                    value={currentMoveIndex}
                    onChange={(e) => handleSeek(parseInt(e.target.value))}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={resetReplay}
                    className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                    style={{ color: 'var(--theme-sub)' }}
                    title="Reset"
                  >
                    <SkipBack className="h-3 w-3" />
                  </button>
                  <button
                    onClick={stepBack}
                    disabled={currentMoveIndex < 0}
                    className="rounded-lg p-1.5 transition-colors disabled:opacity-30"
                    style={{ color: 'var(--theme-sub)' }}
                    title="Step Back"
                  >
                    <SkipBack className="h-2.5 w-2.5" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="rounded-full p-2 transition-colors"
                    style={{
                      backgroundColor: 'var(--theme-accent)',
                      color: 'var(--theme-bg)',
                    }}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={stepForward}
                    disabled={currentMoveIndex >= totalMoves - 1}
                    className="rounded-lg p-1.5 transition-colors disabled:opacity-30"
                    style={{ color: 'var(--theme-sub)' }}
                    title="Step Forward"
                  >
                    <SkipForward className="h-2.5 w-2.5" />
                  </button>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
                    className="rounded-lg border-0 px-2 py-0.5 text-xs outline-none"
                    style={{
                      backgroundColor: 'var(--theme-subAlt)',
                      color: 'var(--theme-text)',
                    }}
                  >
                    <option value={1000}>0.5x</option>
                    <option value={500}>1x</option>
                    <option value={250}>2x</option>
                    <option value={100}>5x</option>
                  </select>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: 0.4 }}
                className="flex w-full max-w-4xl items-center justify-between"
              >
                <StatCard label="moves" value={moves.toString()} />
                <PhaseStatCard
                  label="cross"
                  moves={crossMoves}
                  duration={crossDuration}
                  tps={crossTps}
                />
                <PhaseStatCard label="f2l" moves={f2lMoves} duration={f2lDuration} tps={f2lTps} />
                <PhaseStatCard label="oll" moves={ollMoves} duration={ollDuration} tps={ollTps} />
                <PhaseStatCard label="pll" moves={pllMoves} duration={pllDuration} tps={pllTps} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center gap-4"
          >
            <ActionButton icon={ChevronRight} onClick={onNextScramble} label="Next Scramble" />
            <ActionButton icon={RotateCcw} onClick={onRepeatScramble} label="Repeat Scramble" />
            <ActionButton icon={BarChart3} onClick={onViewStats} label="Detailed Stats" />
            {canReplay ? (
              <ActionButton
                icon={isReplayMode ? Pause : Play}
                onClick={isReplayMode ? exitReplayMode : enterReplayMode}
                label={isReplayMode ? 'Exit Replay' : 'Watch Replay'}
                active={isReplayMode}
              />
            ) : (
              <ActionButton icon={Play} onClick={onWatchReplay} label="Watch Replay" />
            )}
          </motion.div>
        </motion.div>
      </div>
    </TooltipProvider>
  )
}
