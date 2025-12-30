import { useState, useCallback, useRef } from 'react'
import { 
  type CubeFaces, 
  type Color,
  createSolvedCube, 
  applyMove, 
  cloneCube,
  isSolved 
} from '@/lib/cube-faces'

export type { CubeFaces, Color }

function parseAlgorithm(alg: string): string[] {
  return alg.trim().split(/\s+/).filter((m) => m.length > 0)
}

export function useCubeFaces() {
  const [faces, setFaces] = useState<CubeFaces>(createSolvedCube)
  const facesRef = useRef<CubeFaces>(faces)
  const stateHistoryRef = useRef<CubeFaces[]>([createSolvedCube()])
  const moveHistoryRef = useRef<string[]>([])

  const performMove = useCallback((move: string) => {
    const newFaces = applyMove(facesRef.current, move)
    facesRef.current = newFaces
    moveHistoryRef.current.push(move)
    stateHistoryRef.current.push(cloneCube(newFaces))
    setFaces(newFaces)
  }, [])

  const applyScramble = useCallback((scramble: string) => {
    const moves = parseAlgorithm(scramble)
    let cube = createSolvedCube()
    for (const move of moves) {
      cube = applyMove(cube, move)
    }
    facesRef.current = cube
    stateHistoryRef.current = [cloneCube(cube)]
    moveHistoryRef.current = []
    setFaces(cube)
  }, [])

  const reset = useCallback(() => {
    const solved = createSolvedCube()
    facesRef.current = solved
    stateHistoryRef.current = [cloneCube(solved)]
    moveHistoryRef.current = []
    setFaces(solved)
  }, [])

  const checkSolved = useCallback(() => {
    return isSolved(facesRef.current)
  }, [])

  const getHistory = useCallback(() => {
    return {
      moves: [...moveHistoryRef.current],
      states: stateHistoryRef.current.map(cloneCube)
    }
  }, [])

  const clearHistory = useCallback(() => {
    stateHistoryRef.current = [cloneCube(facesRef.current)]
    moveHistoryRef.current = []
  }, [])

  return {
    faces,
    performMove,
    applyScramble,
    reset,
    isSolved: checkSolved,
    getHistory,
    clearHistory,
  }
}
