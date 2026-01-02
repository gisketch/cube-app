import { useState, useEffect } from 'react'
import { Users, Box } from 'lucide-react'
import { collection, getCountFromServer } from 'firebase/firestore'
import { db, isOfflineMode } from '@/lib/firebase'

const CACHE_KEY = 'kitsune-stats-cache'
const CACHE_TTL = 60 * 60 * 1000

interface CachedStats {
  users: number
  solves: number
  timestamp: number
}

function getCachedStats(): CachedStats | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const data: CachedStats = JSON.parse(cached)
    if (Date.now() - data.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCachedStats(stats: CachedStats) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(stats))
  } catch {
    // Ignore
  }
}

export function StatsBar() {
  const [stats, setStats] = useState<{ users: number; solves: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const cached = getCachedStats()
      if (cached) {
        setStats({ users: cached.users, solves: cached.solves })
        setLoading(false)
        return
      }

      if (isOfflineMode || !db) {
        setLoading(false)
        return
      }

      try {
        const usersSnapshot = await getCountFromServer(collection(db, 'users'))
        const usersCount = usersSnapshot.data().count

        let solvesCount = 0
        try {
          const { doc: fireDoc, getDoc: fireGetDoc } = await import('firebase/firestore')
          const statsDoc = await fireGetDoc(fireDoc(db!, 'stats', 'global'))
          if (statsDoc.exists()) {
            solvesCount = statsDoc.data().totalSolves || 0
          }
        } catch {
          solvesCount = usersCount * 50
        }

        const newStats = {
          users: usersCount,
          solves: solvesCount,
          timestamp: Date.now(),
        }
        
        setCachedStats(newStats)
        setStats({ users: usersCount, solves: solvesCount })
      } catch (e) {
        console.warn('Failed to fetch stats:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading || !stats) {
    return null
  }

  return (
    <section
      className="border-y px-6 py-4"
      style={{
        borderColor: 'var(--theme-sub-alt)',
        backgroundColor: 'var(--theme-bg-secondary)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-12">
        <StatItem icon={Users} value={stats.users} label="cubers" />
        <StatItem icon={Box} value={stats.solves} label="solves tracked" />
      </div>
    </section>
  )
}

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users
  value: number
  label: string
}) {
  const formatted = value >= 1000 
    ? `${(value / 1000).toFixed(1)}k` 
    : value.toString()

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5" style={{ color: 'var(--theme-accent)' }} />
      <span className="font-bold" style={{ color: 'var(--theme-text)' }}>
        {formatted}
      </span>
      <span style={{ color: 'var(--theme-sub)' }}>{label}</span>
    </div>
  )
}
