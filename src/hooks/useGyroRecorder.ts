import { useRef, useCallback } from 'react'
import * as THREE from 'three'
import type { GyroFrame, MoveFrame } from '@/types'

const GYRO_SAMPLE_INTERVAL = 50

export function useGyroRecorder() {
  const isRecordingRef = useRef(false)
  const startTimeRef = useRef(0)
  const gyroFramesRef = useRef<GyroFrame[]>([])
  const moveFramesRef = useRef<MoveFrame[]>([])
  const lastSampleTimeRef = useRef(0)

  const startRecording = useCallback(() => {
    isRecordingRef.current = true
    startTimeRef.current = performance.now()
    gyroFramesRef.current = []
    moveFramesRef.current = []
    lastSampleTimeRef.current = 0
  }, [])

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false
    return {
      gyroData: gyroFramesRef.current,
      moveTimings: moveFramesRef.current,
    }
  }, [])

  const recordGyroFrame = useCallback((quaternion: THREE.Quaternion) => {
    if (!isRecordingRef.current) return

    const now = performance.now()
    const elapsed = now - startTimeRef.current

    if (elapsed - lastSampleTimeRef.current >= GYRO_SAMPLE_INTERVAL) {
      gyroFramesRef.current.push({
        time: elapsed,
        quaternion: {
          x: quaternion.x,
          y: quaternion.y,
          z: quaternion.z,
          w: quaternion.w,
        },
      })
      lastSampleTimeRef.current = elapsed
    }
  }, [])

  const recordMove = useCallback((move: string) => {
    if (!isRecordingRef.current) return

    const elapsed = performance.now() - startTimeRef.current
    moveFramesRef.current.push({
      time: elapsed,
      move,
    })
  }, [])

  const isRecording = useCallback(() => isRecordingRef.current, [])

  return {
    startRecording,
    stopRecording,
    recordGyroFrame,
    recordMove,
    isRecording,
  }
}
