import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const PADDING_MAP = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn('rounded-xl', PADDING_MAP[padding], className)}
      style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn('text-sm font-medium uppercase tracking-wider', className)}
      style={{ color: 'var(--theme-sub)' }}
    >
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3
      className={cn('text-lg font-semibold', className)}
      style={{ color: 'var(--theme-text)' }}
    >
      {children}
    </h3>
  )
}
