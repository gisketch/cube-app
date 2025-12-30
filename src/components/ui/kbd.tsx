import type { ReactNode } from 'react'

interface KbdProps {
  children: ReactNode
}

export function Kbd({ children }: KbdProps) {
  return (
    <kbd
      className="rounded px-1.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: 'var(--theme-subAlt)',
        color: 'var(--theme-text)',
      }}
    >
      {children}
    </kbd>
  )
}
