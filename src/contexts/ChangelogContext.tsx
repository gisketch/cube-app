import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db, isOfflineMode } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { getLatestVersion, hasNewChangelog } from '@/lib/changelog'

const STORAGE_KEY = 'cube-changelog-state'

interface ChangelogContextType {
  isOpen: boolean
  hasUnread: boolean
  lastSeenVersion: string | null
  openChangelog: () => void
  closeChangelog: () => void
  markAsRead: () => Promise<void>
}

const ChangelogContext = createContext<ChangelogContextType | null>(null)

function loadLocalState(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.lastSeenVersion || null
    }
  } catch {
    console.error('Failed to load changelog state from localStorage')
  }
  return null
}

function saveLocalState(lastSeenVersion: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastSeenVersion }))
  } catch {
    console.error('Failed to save changelog state to localStorage')
  }
}

export function ChangelogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [lastSeenVersion, setLastSeenVersion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const isGuest = isOfflineMode || !user || !db

  useEffect(() => {
    if (isGuest) {
      const local = loadLocalState()
      setLastSeenVersion(local)
      setLoading(false)
      return
    }

    const userDocRef = doc(db!, 'users', user!.uid)

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setLastSeenVersion(data.lastSeenChangelogVersion || null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error listening to changelog state:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, isGuest])

  const hasUnread = !loading && hasNewChangelog(lastSeenVersion)

  const openChangelog = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeChangelog = useCallback(() => {
    setIsOpen(false)
  }, [])

  const markAsRead = useCallback(async () => {
    const latestVersion = getLatestVersion()
    setLastSeenVersion(latestVersion)

    if (isGuest) {
      saveLocalState(latestVersion)
      return
    }

    try {
      const userDocRef = doc(db!, 'users', user!.uid)
      await updateDoc(userDocRef, {
        lastSeenChangelogVersion: latestVersion,
      })
    } catch (error) {
      console.error('Failed to save changelog state:', error)
      saveLocalState(latestVersion)
    }
  }, [user, isGuest])

  return (
    <ChangelogContext.Provider
      value={{
        isOpen,
        hasUnread,
        lastSeenVersion,
        openChangelog,
        closeChangelog,
        markAsRead,
      }}
    >
      {children}
    </ChangelogContext.Provider>
  )
}

export function useChangelog(): ChangelogContextType {
  const context = useContext(ChangelogContext)
  if (!context) {
    throw new Error('useChangelog must be used within a ChangelogProvider')
  }
  return context
}
