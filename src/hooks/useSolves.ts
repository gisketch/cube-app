import { useState, useEffect, useCallback } from 'react'
import type { Solve } from '@/types'

export type { Solve }

const STORAGE_KEY = 'cube-solves'

function loadSolves(): Solve[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load solves from localStorage:', e)
  }
  return []
}

function saveSolves(solves: Solve[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solves))
  } catch (e) {
    console.error('Failed to save solves to localStorage:', e)
  }
}

export function useSolves() {
  const [solves, setSolves] = useState<Solve[]>(() => loadSolves())

  useEffect(() => {
    saveSolves(solves)
  }, [solves])

  const addSolve = useCallback((solve: Omit<Solve, 'id' | 'date'>) => {
    const newSolve: Solve = {
      ...solve,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    }
    setSolves((prev) => [newSolve, ...prev])
    return newSolve
  }, [])

  const deleteSolve = useCallback((id: string) => {
    setSolves((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const updateSolve = useCallback((id: string, updates: Partial<Solve>) => {
    setSolves((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }, [])

  const clearAll = useCallback(() => {
    setSolves([])
  }, [])

  const getStats = useCallback(() => {
    const validSolves = solves.filter((s) => !s.dnf)
    if (validSolves.length === 0) {
      return { best: null, worst: null, average: null, ao5: null, ao12: null }
    }

    const times = validSolves.map((s) => (s.plusTwo ? s.time + 2000 : s.time))
    const sorted = [...times].sort((a, b) => a - b)

    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    const average = times.reduce((a, b) => a + b, 0) / times.length

    const calcAverage = (count: number) => {
      if (validSolves.length < count) return null
      const recent = times.slice(0, count)
      const sortedRecent = [...recent].sort((a, b) => a - b)
      const trimmed = sortedRecent.slice(1, -1)
      return trimmed.reduce((a, b) => a + b, 0) / trimmed.length
    }

    return {
      best,
      worst,
      average,
      ao5: calcAverage(5),
      ao12: calcAverage(12),
    }
  }, [solves])

  return {
    solves,
    addSolve,
    deleteSolve,
    updateSolve,
    clearAll,
    getStats,
  }
}
