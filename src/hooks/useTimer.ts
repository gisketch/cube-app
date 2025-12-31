import { useState, useRef, useCallback, useEffect } from 'react'

export type TimerStatus = 'idle' | 'inspection' | 'running' | 'stopped'

export interface TimerState {
  status: TimerStatus
  time: number
  inspectionTime: number
}

export function useTimer() {
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [time, setTime] = useState(0)
  const startTimeRef = useRef<number>(0)
  const animationFrameRef = useRef<number>(0)

  const updateTime = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current
    setTime(elapsed)
    animationFrameRef.current = requestAnimationFrame(updateTime)
  }, [])

  const startInspection = useCallback(() => {
    setStatus('inspection')
    setTime(0)
  }, [])

  const startTimer = useCallback(() => {
    if (status !== 'inspection') return
    startTimeRef.current = Date.now()
    setStatus('running')
    animationFrameRef.current = requestAnimationFrame(updateTime)
  }, [status, updateTime])

  const stopTimer = useCallback(() => {
    if (status !== 'running') return
    cancelAnimationFrame(animationFrameRef.current)
    const finalTime = Date.now() - startTimeRef.current
    setTime(finalTime)
    setStatus('stopped')
    return finalTime
  }, [status])

  const reset = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current)
    setStatus('idle')
    setTime(0)
  }, [])

  useEffect(() => {
    return () => cancelAnimationFrame(animationFrameRef.current)
  }, [])

  return {
    status,
    time,
    startInspection,
    startTimer,
    stopTimer,
    reset,
  }
}
