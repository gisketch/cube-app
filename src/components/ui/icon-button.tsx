import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface IconButtonProps {
  icon: LucideIcon
  onClick?: () => void
  label: string
  disabled?: boolean
  variant?: 'default' | 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  sm: { button: 'h-8 w-8', icon: 'h-4 w-4' },
  md: { button: 'h-10 w-10', icon: 'h-5 w-5' },
  lg: { button: 'h-12 w-12', icon: 'h-5 w-5' },
}

const VARIANT_STYLES = {
  default: {
    backgroundColor: 'var(--theme-subAlt)',
    color: 'var(--theme-text)',
  },
  accent: {
    backgroundColor: 'var(--theme-accent)',
    color: 'var(--theme-bg)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--theme-sub)',
  },
}

export function IconButton({
  icon: Icon,
  onClick,
  label,
  disabled,
  variant = 'default',
  size = 'md',
}: IconButtonProps) {
  if (!onClick) return null

  const sizeClasses = SIZE_MAP[size]
  const styles = VARIANT_STYLES[variant]

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses.button}`}
      style={styles}
      title={label}
    >
      <Icon className={sizeClasses.icon} />
    </motion.button>
  )
}
