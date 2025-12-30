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

export function useCubeFaces() {
  const [faces, setFaces] = useState<CubeFaces>(createSolvedCube)
  const facesRef = useRef<CubeFaces>(faces)

  const performMove = useCallback((move: string) => {
    const newFaces = applyMove(facesRef.current, move)
    facesRef.current = newFaces
    setFaces(newFaces)
  }, [])

  const reset = useCallback(() => {
    const solved = createSolvedCube()
    facesRef.current = solved
    setFaces(solved)
  }, [])

  const checkSolved = useCallback(() => {
    return isSolved(facesRef.current)
  }, [])

  return {
    faces,
    performMove,
    reset,
    isSolved: checkSolved,
  }
}
