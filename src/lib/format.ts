export function formatTime(ms: number, totalMs?: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const centiseconds = Math.floor((ms % 1000) / 10)

  const refMs = totalMs ?? ms
  const refTotalSeconds = Math.floor(refMs / 1000)
  const refMinutes = Math.floor(refTotalSeconds / 60)
  const needsMinutes = refMinutes > 0
  const needsTwoDigitSeconds = refTotalSeconds >= 10 || needsMinutes

  if (needsMinutes) {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }
  if (needsTwoDigitSeconds) {
    return `${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }
  return `${seconds}.${centiseconds.toString().padStart(2, '0')}`
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return '0.00s'
  if (ms < 1000) return `${ms.toFixed(0)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function formatTPS(tps: number): string {
  return tps.toFixed(2)
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString()
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}
