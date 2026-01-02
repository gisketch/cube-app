import type { Solve } from '@/types'

export interface SessionStats {
  best: number | null
  worst: number | null
  average: number | null
  ao5: number | null
  ao12: number | null
  ao5Best: number | null
  ao12Best: number | null
  solveCount: number
}

function getValidTimes(solves: Solve[]): number[] {
  return solves
    .filter((s) => !s.dnf)
    .map((s) => (s.plusTwo ? s.time + 2000 : s.time))
}

function calculateAo(times: number[], n: number): number | null {
  if (times.length < n) return null
  const lastN = times.slice(0, n)
  const sorted = [...lastN].sort((a, b) => a - b)
  const trimmed = sorted.slice(1, -1)
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length
}

function calculateAoBest(times: number[], n: number): number | null {
  if (times.length < n) return null
  
  let bestAo: number | null = null
  
  for (let i = 0; i <= times.length - n; i++) {
    const window = times.slice(i, i + n)
    const sorted = [...window].sort((a, b) => a - b)
    const trimmed = sorted.slice(1, -1)
    const ao = trimmed.reduce((a, b) => a + b, 0) / trimmed.length
    
    if (bestAo === null || ao < bestAo) {
      bestAo = ao
    }
  }
  
  return bestAo
}

export function calculateSessionStats(solves: Solve[]): SessionStats {
  const times = getValidTimes(solves)
  
  if (times.length === 0) {
    return {
      best: null,
      worst: null,
      average: null,
      ao5: null,
      ao12: null,
      ao5Best: null,
      ao12Best: null,
      solveCount: solves.length,
    }
  }
  
  const best = Math.min(...times)
  const worst = Math.max(...times)
  const average = times.reduce((a, b) => a + b, 0) / times.length
  const ao5 = calculateAo(times, 5)
  const ao12 = calculateAo(times, 12)
  const ao5Best = calculateAoBest(times, 5)
  const ao12Best = calculateAoBest(times, 12)
  
  return {
    best,
    worst,
    average,
    ao5,
    ao12,
    ao5Best,
    ao12Best,
    solveCount: solves.length,
  }
}
