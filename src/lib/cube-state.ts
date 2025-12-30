import { cube3x3x3 } from 'cubing/puzzles'
import { Alg } from 'cubing/alg'
import { randomScrambleForEvent } from 'cubing/scramble'
import type { KPuzzle, KTransformation, KPattern } from 'cubing/kpuzzle'

export type FaceletColor = 'U' | 'D' | 'F' | 'B' | 'L' | 'R'

export const COLOR_MAP: Record<FaceletColor, string> = {
  U: '#ffffff', // White (top)
  D: '#ffd500', // Yellow (bottom)
  F: '#009b48', // Green (front)
  B: '#0045ad', // Blue (back)
  R: '#b90000', // Red (right)
  L: '#ff5900', // Orange (left)
}

export const FACE_NAMES = ['U', 'L', 'F', 'R', 'B', 'D'] as const
export type FaceName = (typeof FACE_NAMES)[number]

export interface CubeState {
  kpuzzle: KPuzzle
  pattern: KPattern
  transformation: KTransformation
  facelets: string
}

let cachedKPuzzle: KPuzzle | null = null

export async function getKPuzzle(): Promise<KPuzzle> {
  if (!cachedKPuzzle) {
    cachedKPuzzle = await cube3x3x3.kpuzzle()
  }
  return cachedKPuzzle
}

function createSolvedFacelets(): string {
  return 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'
}

export async function createSolvedState(): Promise<CubeState> {
  const kpuzzle = await getKPuzzle()
  const pattern = kpuzzle.defaultPattern()
  const transformation = kpuzzle.identityTransformation()

  return { kpuzzle, pattern, transformation, facelets: createSolvedFacelets() }
}

function rotateFaceCW(facelets: string, faceStart: number): string {
  const arr = facelets.split('')
  const f = faceStart
  const temp = arr[f]
  arr[f] = arr[f + 6]
  arr[f + 6] = arr[f + 8]
  arr[f + 8] = arr[f + 2]
  arr[f + 2] = temp

  const temp2 = arr[f + 1]
  arr[f + 1] = arr[f + 3]
  arr[f + 3] = arr[f + 7]
  arr[f + 7] = arr[f + 5]
  arr[f + 5] = temp2

  return arr.join('')
}

function rotateFaceCCW(facelets: string, faceStart: number): string {
  let result = facelets
  for (let i = 0; i < 3; i++) result = rotateFaceCW(result, faceStart)
  return result
}

function applyMoveToFacelets(facelets: string, move: string): string {
  const arr = facelets.split('')

  const cycle4CW = (a: number, b: number, c: number, d: number) => {
    const temp = arr[d]
    arr[d] = arr[c]
    arr[c] = arr[b]
    arr[b] = arr[a]
    arr[a] = temp
  }

  const cycle4CCW = (a: number, b: number, c: number, d: number) => {
    const temp = arr[a]
    arr[a] = arr[b]
    arr[b] = arr[c]
    arr[c] = arr[d]
    arr[d] = temp
  }

  let result = facelets
  const face = move[0]
  const isPrime = move.includes("'")
  const isDouble = move.includes('2')

  const times = isDouble ? 2 : 1

  for (let t = 0; t < times; t++) {
    switch (face) {
      case 'U':
        if (isPrime) {
          cycle4CCW(18, 9, 45, 36); cycle4CCW(19, 10, 46, 37); cycle4CCW(20, 11, 47, 38)
          result = rotateFaceCCW(arr.join(''), 0)
        } else {
          cycle4CW(18, 9, 45, 36); cycle4CW(19, 10, 46, 37); cycle4CW(20, 11, 47, 38)
          result = rotateFaceCW(arr.join(''), 0)
        }
        break
      case 'D':
        if (isPrime) {
          cycle4CCW(24, 15, 51, 42); cycle4CCW(25, 16, 52, 43); cycle4CCW(26, 17, 53, 44)
          result = rotateFaceCCW(arr.join(''), 27)
        } else {
          cycle4CW(24, 15, 51, 42); cycle4CW(25, 16, 52, 43); cycle4CW(26, 17, 53, 44)
          result = rotateFaceCW(arr.join(''), 27)
        }
        break
      case 'R':
        if (isPrime) {
          cycle4CCW(2, 20, 29, 51); cycle4CCW(5, 23, 32, 48); cycle4CCW(8, 26, 35, 45)
          result = rotateFaceCCW(arr.join(''), 9)
        } else {
          cycle4CW(2, 20, 29, 51); cycle4CW(5, 23, 32, 48); cycle4CW(8, 26, 35, 45)
          result = rotateFaceCW(arr.join(''), 9)
        }
        break
      case 'L':
        if (isPrime) {
          cycle4CCW(0, 53, 27, 18); cycle4CCW(3, 50, 30, 21); cycle4CCW(6, 47, 33, 24)
          result = rotateFaceCCW(arr.join(''), 36)
        } else {
          cycle4CW(0, 53, 27, 18); cycle4CW(3, 50, 30, 21); cycle4CW(6, 47, 33, 24)
          result = rotateFaceCW(arr.join(''), 36)
        }
        break
      case 'F':
        if (isPrime) {
          cycle4CCW(6, 44, 29, 9); cycle4CCW(7, 41, 28, 12); cycle4CCW(8, 38, 27, 15)
          result = rotateFaceCCW(arr.join(''), 18)
        } else {
          cycle4CW(6, 44, 29, 9); cycle4CW(7, 41, 28, 12); cycle4CW(8, 38, 27, 15)
          result = rotateFaceCW(arr.join(''), 18)
        }
        break
      case 'B':
        if (isPrime) {
          cycle4CCW(2, 11, 33, 42); cycle4CCW(1, 14, 34, 39); cycle4CCW(0, 17, 35, 36)
          result = rotateFaceCCW(arr.join(''), 45)
        } else {
          cycle4CW(2, 11, 33, 42); cycle4CW(1, 14, 34, 39); cycle4CW(0, 17, 35, 36)
          result = rotateFaceCW(arr.join(''), 45)
        }
        break
    }
    for (let i = 0; i < result.length; i++) arr[i] = result[i]
  }

  return arr.join('')
}

export async function applyAlgorithm(state: CubeState, alg: string): Promise<CubeState> {
  const algorithm = new Alg(alg)
  const newTransformation = state.kpuzzle.algToTransformation(algorithm)
  const combinedTransformation = state.transformation.applyTransformation(newTransformation)
  const newPattern = state.kpuzzle.defaultPattern().applyTransformation(combinedTransformation)

  const moves = alg.trim().split(/\s+/)
  let newFacelets = state.facelets
  for (const move of moves) {
    if (move) newFacelets = applyMoveToFacelets(newFacelets, move)
  }

  return {
    ...state,
    pattern: newPattern,
    transformation: combinedTransformation,
    facelets: newFacelets,
  }
}

export async function applyMove(state: CubeState, move: string): Promise<CubeState> {
  const algorithm = new Alg(move)
  const newTransformation = state.kpuzzle.algToTransformation(algorithm)
  const combinedTransformation = state.transformation.applyTransformation(newTransformation)
  const newPattern = state.kpuzzle.defaultPattern().applyTransformation(combinedTransformation)

  return {
    ...state,
    pattern: newPattern,
    transformation: combinedTransformation,
    facelets: applyMoveToFacelets(state.facelets, move),
  }
}

export async function generateScramble(): Promise<string> {
  const scramble = await randomScrambleForEvent('333')
  return scramble.toString()
}

export function isCubeSolved(state: CubeState): boolean {
  return state.transformation.isIdentityTransformation()
}

export function faceletsStringToRecord(facelets: string): Record<FaceName, FaceletColor[]> {
  return {
    U: facelets.slice(0, 9).split('') as FaceletColor[],
    R: facelets.slice(9, 18).split('') as FaceletColor[],
    F: facelets.slice(18, 27).split('') as FaceletColor[],
    D: facelets.slice(27, 36).split('') as FaceletColor[],
    L: facelets.slice(36, 45).split('') as FaceletColor[],
    B: facelets.slice(45, 54).split('') as FaceletColor[],
  }
}

export function patternToFacelets(pattern: KPattern, facelets?: string): Record<FaceName, FaceletColor[]> {
  if (facelets) {
    return faceletsStringToRecord(facelets)
  }
  return faceletsStringToRecord(createSolvedFacelets())
}
