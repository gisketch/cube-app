import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  type CubeState,
  createSolvedState,
  applyMove,
  applyAlgorithm,
  generateScramble,
  isCubeSolved,
  applyMoveToFacelets,
  SOLVED_FACELETS,
} from '@/lib/cube-state'

export function useCubeState() {
  const [cubeState, setCubeState] = useState<CubeState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentScramble, setCurrentScramble] = useState<string>('')
  const stateRef = useRef<CubeState | null>(null)
  const faceletsRef = useRef<string>(SOLVED_FACELETS)

  useEffect(() => {
    createSolvedState().then((state) => {
      setCubeState(state)
      stateRef.current = state
      faceletsRef.current = state.facelets
      setIsLoading(false)
    })
  }, [])

  const isSolved = useMemo(() => {
    if (!cubeState) return true
    return isCubeSolved(cubeState)
  }, [cubeState])

  const performMove = useCallback(async (move: string): Promise<string> => {
    faceletsRef.current = applyMoveToFacelets(faceletsRef.current, move)
    
    if (stateRef.current) {
      const newState = await applyMove(stateRef.current, move)
      stateRef.current = newState
      setCubeState(newState)
    }
    
    return faceletsRef.current
  }, [])

  const performAlgorithm = useCallback(async (alg: string) => {
    if (!stateRef.current) return
    const newState = await applyAlgorithm(stateRef.current, alg)
    stateRef.current = newState
    faceletsRef.current = newState.facelets
    setCubeState(newState)
  }, [])

  const reset = useCallback(async () => {
    const state = await createSolvedState()
    stateRef.current = state
    faceletsRef.current = state.facelets
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
      faceletsRef.current = newState.facelets
      setCubeState(newState)
    }
    return scrambleAlg
  }, [reset])

  const getFacelets = useCallback(() => faceletsRef.current, [])

  return {
    cubeState,
    isLoading,
    currentScramble,
    isSolved,
    performMove,
    performAlgorithm,
    reset,
    scramble,
    getFacelets,
  }
}
