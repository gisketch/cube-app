import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal, ExternalLink } from 'lucide-react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatTime } from '@/lib/format'
import { getLevelFromXP } from '@/lib/experience'

interface LeaderboardUser {
  id: string
  displayName: string
  photoURL: string | null
  level: number
  avgSolveTime: number | null
  totalSolves: number
}

export function LeaderboardPreview() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTopUsers() {
      if (!db) return

      try {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, orderBy('totalXP', 'desc'), limit(50))
        const snapshot = await getDocs(q)

        const allUsers: LeaderboardUser[] = []
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data()
          const stats = data.stats || {}
          const level = getLevelFromXP(data.totalXP || 0).level
          const avgSolveTime = stats.verifiedAvgSolveTime ?? stats.avgSolveTime ?? null
          const totalSolves = stats.verifiedTotalSolves || stats.totalSolves || 0

          if (avgSolveTime !== null && avgSolveTime > 0 && totalSolves >= 5) {
            allUsers.push({
              id: docSnap.id,
              displayName: data.displayName || 'Cuber',
              photoURL: data.photoURL || null,
              level,
              avgSolveTime,
              totalSolves,
            })
          }
        }

        const sortedUsers = allUsers
          .sort((a, b) => (a.avgSolveTime || Infinity) - (b.avgSolveTime || Infinity))
          .slice(0, 5)

        setUsers(sortedUsers)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopUsers()
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Crown className="h-5 w-5" style={{ color: '#ffd700' }} />
      case 1:
        return <Medal className="h-5 w-5" style={{ color: '#c0c0c0' }} />
      case 2:
        return <Medal className="h-5 w-5" style={{ color: '#cd7f32' }} />
      default:
        return (
          <span className="text-sm font-bold" style={{ color: 'var(--theme-sub)' }}>
            #{rank + 1}
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <section id="leaderboard" className="px-6 py-20" style={{ backgroundColor: 'var(--theme-bg-secondary)' }}>
        <div className="mx-auto max-w-4xl">
          <div className="flex h-64 items-center justify-center">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--theme-accent)', borderTopColor: 'transparent' }}
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="leaderboard" className="px-6 py-20" style={{ backgroundColor: 'var(--theme-bg-secondary)' }}>
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl" style={{ color: 'var(--theme-text)' }}>
            Global Leaderboards
          </h2>
          <p className="mx-auto max-w-2xl text-lg" style={{ color: 'var(--theme-sub)' }}>
            Compete with cubers worldwide. Climb the ranks. Leave your mark.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="overflow-hidden rounded-2xl"
          style={{ backgroundColor: 'var(--theme-bg)', border: '1px solid var(--theme-sub-alt)' }}
        >
          <div className="p-4" style={{ borderBottom: '1px solid var(--theme-sub-alt)' }}>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5" style={{ color: 'var(--theme-accent)' }} />
              <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>
                Top Players by Average Time
              </span>
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--theme-sub-alt)' }}>
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-white/5"
              >
                <div className="flex w-8 items-center justify-center">{getRankIcon(index)}</div>

                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
                    style={{ backgroundColor: 'var(--theme-accent)', color: 'var(--theme-bg)' }}
                  >
                    {user.displayName[0].toUpperCase()}
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-semibold" style={{ color: 'var(--theme-text)' }}>
                    {user.displayName}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--theme-sub)' }}>
                    Level {user.level} • {user.totalSolves.toLocaleString()} solves
                  </p>
                </div>

                {user.avgSolveTime && (
                  <div className="text-right">
                    <p className="font-mono font-bold" style={{ color: 'var(--theme-accent)' }}>
                      {formatTime(user.avgSolveTime)}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--theme-sub)' }}>
                      avg
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="p-4" style={{ borderTop: '1px solid var(--theme-sub-alt)' }}>
            <a
              href="/app/leaderboard"
              className="flex items-center justify-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--theme-accent)' }}
            >
              View Full Leaderboard <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
