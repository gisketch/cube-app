import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  type CubeState,
  createSolvedState,
  applyMove,
  applyAlgorithm,
  generateScramble,
  isCubeSolved,
} from '@/lib/cube-state'

export function useCubeState() {
  const [cubeState, setCubeState] = useState<CubeState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentScramble, setCurrentScramble] = useState<string>('')
  const stateRef = useRef<CubeState | null>(null)

  useEffect(() => {
    createSolvedState().then((state) => {
      setCubeState(state)
      stateRef.current = state
      setIsLoading(false)
    })
  }, [])

  const isSolved = useMemo(() => {
    if (!cubeState) return true
    return isCubeSolved(cubeState)
  }, [cubeState])

  const performMove = useCallback(async (move: string) => {
    if (!stateRef.current) return
    const newState = await applyMove(stateRef.current, move)
    stateRef.current = newState
    setCubeState(newState)
  }, [])

  const performAlgorithm = useCallback(async (alg: string) => {
    if (!stateRef.current) return
    const newState = await applyAlgorithm(stateRef.current, alg)
    stateRef.current = newState
    setCubeState(newState)
  }, [])

  const reset = useCallback(async () => {
    const state = await createSolvedState()
    stateRef.current = state
    setCubeState(state)
    setCurrentScramble('')
  }, [])

  const scramble = useCallback(async () => {
    const scrambleAlg = await generateScramble()
    setCurrentScramble(scrambleAlg)
    await reset()
    if (stateRef.current) {
      const newState = await applyAlgorithm(stateRef.current, scrambleAlg)
      stateRef.current = newState
      setCubeState(newState)
    }
    return scrambleAlg
  }, [reset])

  return {
    cubeState,
    isLoading,
    currentScramble,
    isSolved,
    performMove,
    performAlgorithm,
    reset,
    scramble,
  }
}
