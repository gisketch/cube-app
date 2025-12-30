import { useCallback, useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  handler: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey : true
        const keyMatch = e.key === shortcut.key

        if (ctrlMatch && keyMatch) {
          e.preventDefault()
          shortcut.handler()
          return
        }
      }
    },
    [shortcuts],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
