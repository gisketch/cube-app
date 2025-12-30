export type Color = 'W' | 'Y' | 'G' | 'B' | 'R' | 'O'

export const COLOR_HEX: Record<Color, string> = {
  W: '#ffffff',
  Y: '#ffd500',
  G: '#009b48',
  B: '#0045ad',
  R: '#b90000',
  O: '#ff5900',
}

export interface CubeFaces {
  U: Color[]
  D: Color[]
  F: Color[]
  B: Color[]
  L: Color[]
  R: Color[]
}

export function createSolvedCube(): CubeFaces {
  return {
    U: ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
    D: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
    F: ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
    B: ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
    L: ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
    R: ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
  }
}

function rotateFaceCW(face: Color[]): Color[] {
  return [
    face[6], face[3], face[0],
    face[7], face[4], face[1],
    face[8], face[5], face[2],
  ]
}

export function applyMove(cube: CubeFaces, move: string): CubeFaces {
  const result: CubeFaces = {
    U: [...cube.U],
    D: [...cube.D],
    F: [...cube.F],
    B: [...cube.B],
    L: [...cube.L],
    R: [...cube.R],
  }

  const face = move[0]
  const isPrime = move.includes("'")
  const isDouble = move.includes('2')
  const times = isDouble ? 2 : isPrime ? 3 : 1

  for (let t = 0; t < times; t++) {
    switch (face) {
      case 'U': {
        result.U = rotateFaceCW(result.U)
        const temp = [result.F[0], result.F[1], result.F[2]]
        result.F[0] = result.R[0]; result.F[1] = result.R[1]; result.F[2] = result.R[2]
        result.R[0] = result.B[0]; result.R[1] = result.B[1]; result.R[2] = result.B[2]
        result.B[0] = result.L[0]; result.B[1] = result.L[1]; result.B[2] = result.L[2]
        result.L[0] = temp[0]; result.L[1] = temp[1]; result.L[2] = temp[2]
        break
      }
      case 'D': {
        result.D = rotateFaceCW(result.D)
        const temp = [result.F[6], result.F[7], result.F[8]]
        result.F[6] = result.L[6]; result.F[7] = result.L[7]; result.F[8] = result.L[8]
        result.L[6] = result.B[6]; result.L[7] = result.B[7]; result.L[8] = result.B[8]
        result.B[6] = result.R[6]; result.B[7] = result.R[7]; result.B[8] = result.R[8]
        result.R[6] = temp[0]; result.R[7] = temp[1]; result.R[8] = temp[2]
        break
      }
      case 'F': {
        result.F = rotateFaceCW(result.F)
        const temp = [result.U[6], result.U[7], result.U[8]]
        result.U[6] = result.L[8]; result.U[7] = result.L[5]; result.U[8] = result.L[2]
        result.L[2] = result.D[0]; result.L[5] = result.D[1]; result.L[8] = result.D[2]
        result.D[0] = result.R[6]; result.D[1] = result.R[3]; result.D[2] = result.R[0]
        result.R[0] = temp[0]; result.R[3] = temp[1]; result.R[6] = temp[2]
        break
      }
      case 'B': {
        result.B = rotateFaceCW(result.B)
        const temp = [result.U[0], result.U[1], result.U[2]]
        result.U[0] = result.R[2]; result.U[1] = result.R[5]; result.U[2] = result.R[8]
        result.R[2] = result.D[8]; result.R[5] = result.D[7]; result.R[8] = result.D[6]
        result.D[6] = result.L[0]; result.D[7] = result.L[3]; result.D[8] = result.L[6]
        result.L[0] = temp[2]; result.L[3] = temp[1]; result.L[6] = temp[0]
        break
      }
      case 'L': {
        result.L = rotateFaceCW(result.L)
        const temp = [result.U[0], result.U[3], result.U[6]]
        result.U[0] = result.B[8]; result.U[3] = result.B[5]; result.U[6] = result.B[2]
        result.B[2] = result.D[6]; result.B[5] = result.D[3]; result.B[8] = result.D[0]
        result.D[0] = result.F[0]; result.D[3] = result.F[3]; result.D[6] = result.F[6]
        result.F[0] = temp[0]; result.F[3] = temp[1]; result.F[6] = temp[2]
        break
      }
      case 'R': {
        result.R = rotateFaceCW(result.R)
        const temp = [result.U[2], result.U[5], result.U[8]]
        result.U[2] = result.F[2]; result.U[5] = result.F[5]; result.U[8] = result.F[8]
        result.F[2] = result.D[2]; result.F[5] = result.D[5]; result.F[8] = result.D[8]
        result.D[2] = result.B[6]; result.D[5] = result.B[3]; result.D[8] = result.B[0]
        result.B[0] = temp[2]; result.B[3] = temp[1]; result.B[6] = temp[0]
        break
      }
    }
  }

  return result
}

export function cloneCube(cube: CubeFaces): CubeFaces {
  return {
    U: [...cube.U],
    D: [...cube.D],
    F: [...cube.F],
    B: [...cube.B],
    L: [...cube.L],
    R: [...cube.R],
  }
}

export function isSolved(cube: CubeFaces): boolean {
  const checkFace = (face: Color[]): boolean => face.every(c => c === face[4])
  return checkFace(cube.U) && checkFace(cube.D) && checkFace(cube.F) && 
         checkFace(cube.B) && checkFace(cube.L) && checkFace(cube.R)
}

const COLOR_TO_FACELET: Record<Color, string> = {
  W: 'U', Y: 'D', G: 'F', B: 'B', R: 'R', O: 'L'
}

export function cubeFacesToFacelets(cube: CubeFaces): string {
  const u = cube.U.map(c => COLOR_TO_FACELET[c]).join('')
  const r = cube.R.map(c => COLOR_TO_FACELET[c]).join('')
  const f = cube.F.map(c => COLOR_TO_FACELET[c]).join('')
  const d = cube.D.map(c => COLOR_TO_FACELET[c]).join('')
  const l = cube.L.map(c => COLOR_TO_FACELET[c]).join('')
  const b = cube.B.map(c => COLOR_TO_FACELET[c]).join('')
  return u + r + f + d + l + b
}
