import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface StatDisplayProps {
  label: string
  value: string | number
  subtext?: string
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const SIZE_MAP = {
  sm: { label: 'text-xs', value: 'text-xl', subtext: 'text-xs' },
  md: { label: 'text-sm', value: 'text-3xl', subtext: 'text-sm' },
  lg: { label: 'text-base', value: 'text-6xl', subtext: 'text-base' },
}

export function StatDisplay({ label, value, subtext, size = 'md', animate = true }: StatDisplayProps) {
  const sizes = SIZE_MAP[size]

  const content = (
    <div className="flex flex-col items-start">
      <span className={`tracking-wide ${sizes.label}`} style={{ color: 'var(--theme-sub)' }}>
        {label}
      </span>
      <span className={`font-bold ${sizes.value}`} style={{ color: 'var(--theme-text)' }}>
        {value}
      </span>
      {subtext && (
        <span className={sizes.subtext} style={{ color: 'var(--theme-sub)' }}>
          {subtext}
        </span>
      )}
    </div>
  )

  if (!animate) return content

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {content}
    </motion.div>
  )
}

interface StatRowProps {
  children: ReactNode
  className?: string
}

export function StatRow({ children, className = '' }: StatRowProps) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {children}
    </div>
  )
}
