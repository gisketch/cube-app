import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Timer,
  Trophy,
  Battery,
  BatteryWarning,
  Bluetooth,
  Boxes,
  ChevronDown,
  Check,
  Eye,
  LayoutGrid,
  Minimize2,
} from 'lucide-react'
import { formatTime } from '@/lib/format'
import type { Solve } from '@/types'
import type { InspectionTime, TimerLayoutMode } from '@/hooks/useSettings'

type AverageType = 'ao5' | 'ao12' | 'ao50' | 'ao100'

interface StatusBarProps {
  solves: Solve[]
  method?: string
  inspectionTime?: InspectionTime
  customInspectionTime?: number
  layoutMode?: TimerLayoutMode
  onMethodChange?: (method: string) => void
  onInspectionChange?: (time: InspectionTime) => void
  onLayoutModeChange?: (mode: TimerLayoutMode) => void
}

function calculateAverages(solves: Solve[]) {
  if (solves.length === 0) return { ao5: null, ao12: null, ao50: null, ao100: null, best: null }

  const times = solves.filter((s) => !s.dnf).map((s) => (s.plusTwo ? s.time + 2000 : s.time))
  if (times.length === 0) return { ao5: null, ao12: null, ao50: null, ao100: null, best: null }

  const best = Math.min(...times)

  const calcAo = (n: number) => {
    if (times.length < n) return null
    const lastN = times.slice(0, n)
    const sorted = [...lastN].sort((a, b) => a - b)
    const trimmed = sorted.slice(1, -1)
    return trimmed.reduce((a, b) => a + b, 0) / trimmed.length
  }

  return {
    ao5: calcAo(5),
    ao12: calcAo(12),
    ao50: calcAo(50),
    ao100: calcAo(100),
    best,
  }
}

interface DropdownProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
}

function Dropdown({ isOpen, onClose, children, align = 'center' }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const alignClass =
    align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={`absolute top-full z-50 mt-2 min-w-[120px] rounded-lg border py-1 shadow-lg ${alignClass}`}
          style={{
            backgroundColor: 'var(--theme-bgSecondary)',
            borderColor: 'var(--theme-subAlt)',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface DropdownItemProps {
  children: React.ReactNode
  onClick: () => void
  selected?: boolean
}

function DropdownItem({ children, onClick, selected }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 px-3 py-1.5 text-sm transition-colors hover:bg-[var(--theme-subAlt)]"
      style={{ color: 'var(--theme-text)' }}
    >
      <span>{children}</span>
      {selected && <Check className="h-3.5 w-3.5" style={{ color: 'var(--theme-accent)' }} />}
    </button>
  )
}

interface StatusButtonProps {
  icon: typeof Timer
  label?: string
  value: string
  onClick?: () => void
  hasDropdown?: boolean
  color?: string
  compact?: boolean
  showLabel?: boolean
}

function StatusButton({
  icon: Icon,
  label,
  value,
  onClick,
  hasDropdown,
  color,
  compact,
  showLabel = false,
}: StatusButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-1 rounded-md transition-all hover:bg-[var(--theme-subAlt)] ${compact ? 'px-1.5 py-0.5 text-xs md:text-sm' : 'px-2 py-1 text-sm'}`}
      style={{ color: color || 'var(--theme-sub)' }}
    >
      <Icon className={`transition-colors group-hover:text-[var(--theme-text)] ${compact ? 'h-3 w-3 md:h-3.5 md:w-3.5' : 'h-4 w-4'}`} />
      {showLabel && label && (
        <span className="transition-colors group-hover:text-[var(--theme-text)]">{label}</span>
      )}
      <span className="font-medium transition-colors group-hover:text-[var(--theme-accent)]">
        {value}
      </span>
      {hasDropdown && (
        <ChevronDown className="h-3 w-3 transition-colors group-hover:text-[var(--theme-text)]" />
      )}
    </button>
  )
}

export function StatusBar({
  solves,
  method = 'CFOP',
  inspectionTime = 'none',
  customInspectionTime = 15,
  layoutMode = 'detailed',
  onMethodChange,
  onInspectionChange,
  onLayoutModeChange,
}: StatusBarProps) {
  const [methodOpen, setMethodOpen] = useState(false)
  const [avgOpen, setAvgOpen] = useState(false)
  const [inspectionOpen, setInspectionOpen] = useState(false)
  const [layoutOpen, setLayoutOpen] = useState(false)
  const [selectedAvg, setSelectedAvg] = useState<AverageType>('ao5')

  const averages = useMemo(() => calculateAverages(solves), [solves])

  const avgValue = averages[selectedAvg]

  const getInspectionLabel = () => {
    if (inspectionTime === 'none') return 'off'
    if (inspectionTime === 'custom') return `${customInspectionTime}s`
    return `${inspectionTime}s`
  }

  const handleMethodSelect = (m: string) => {
    onMethodChange?.(m)
    setMethodOpen(false)
  }

  const handleAvgSelect = (avg: AverageType) => {
    setSelectedAvg(avg)
    setAvgOpen(false)
  }

  const handleInspectionSelect = (time: InspectionTime) => {
    onInspectionChange?.(time)
    setInspectionOpen(false)
  }

  return (
    <div className="flex items-center justify-center gap-1 py-1 md:gap-2 md:py-2">
      <div className="relative hidden md:block">
        <StatusButton
          icon={Boxes}
          value={method.toLowerCase()}
          onClick={() => setMethodOpen(!methodOpen)}
          hasDropdown
        />
        <Dropdown isOpen={methodOpen} onClose={() => setMethodOpen(false)}>
          <DropdownItem onClick={() => handleMethodSelect('CFOP')} selected={method === 'CFOP'}>
            cfop
          </DropdownItem>
        </Dropdown>
      </div>

      <div className="relative">
        <StatusButton
          icon={Eye}
          value={getInspectionLabel()}
          onClick={() => setInspectionOpen(!inspectionOpen)}
          hasDropdown
          compact
        />
        <Dropdown isOpen={inspectionOpen} onClose={() => setInspectionOpen(false)}>
          <DropdownItem onClick={() => handleInspectionSelect('none')} selected={inspectionTime === 'none'}>
            Off
          </DropdownItem>
          <DropdownItem onClick={() => handleInspectionSelect('15')} selected={inspectionTime === '15'}>
            15s
          </DropdownItem>
          <DropdownItem onClick={() => handleInspectionSelect('30')} selected={inspectionTime === '30'}>
            30s
          </DropdownItem>
          <DropdownItem onClick={() => handleInspectionSelect('60')} selected={inspectionTime === '60'}>
            60s
          </DropdownItem>
        </Dropdown>
      </div>

      <div className="relative">
        <StatusButton
          icon={Timer}
          value={avgValue ? formatTime(avgValue) : '-'}
          onClick={() => setAvgOpen(!avgOpen)}
          hasDropdown
          compact
        />
        <Dropdown isOpen={avgOpen} onClose={() => setAvgOpen(false)}>
          <DropdownItem onClick={() => handleAvgSelect('ao5')} selected={selectedAvg === 'ao5'}>
            ao5
          </DropdownItem>
          <DropdownItem onClick={() => handleAvgSelect('ao12')} selected={selectedAvg === 'ao12'}>
            ao12
          </DropdownItem>
          <DropdownItem onClick={() => handleAvgSelect('ao50')} selected={selectedAvg === 'ao50'}>
            ao50
          </DropdownItem>
          <DropdownItem onClick={() => handleAvgSelect('ao100')} selected={selectedAvg === 'ao100'}>
            ao100
          </DropdownItem>
        </Dropdown>
      </div>

      <StatusButton
        icon={Trophy}
        value={averages.best ? formatTime(averages.best) : '-'}
        compact
      />

      <div className="relative hidden md:block">
        <StatusButton
          icon={layoutMode === 'detailed' ? LayoutGrid : Minimize2}
          value={layoutMode === 'detailed' ? 'detailed' : 'minimal'}
          onClick={() => setLayoutOpen(!layoutOpen)}
          hasDropdown
        />
        <Dropdown isOpen={layoutOpen} onClose={() => setLayoutOpen(false)}>
          <DropdownItem 
            onClick={() => { onLayoutModeChange?.('detailed'); setLayoutOpen(false) }} 
            selected={layoutMode === 'detailed'}
          >
            detailed
          </DropdownItem>
          <DropdownItem 
            onClick={() => { onLayoutModeChange?.('minimal'); setLayoutOpen(false) }} 
            selected={layoutMode === 'minimal'}
          >
            minimal
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  )
}

interface CubeConnectionStatusProps {
  batteryLevel: number | null
  isConnected: boolean
  isConnecting?: boolean
  onConnect?: () => void
  onOpenCubeInfo?: () => void
}

export function CubeConnectionStatus({
  batteryLevel,
  isConnected,
  isConnecting,
  onConnect,
  onOpenCubeInfo,
}: CubeConnectionStatusProps) {
  if (isConnected) {
    return (
      <div className="flex items-center justify-center py-1 md:hidden">
        <StatusButton
          icon={batteryLevel !== null && batteryLevel <= 20 ? BatteryWarning : Battery}
          value={batteryLevel !== null ? `${batteryLevel}%` : '-'}
          onClick={onOpenCubeInfo}
          color={batteryLevel !== null && batteryLevel <= 20 ? 'var(--theme-error)' : undefined}
          compact
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-2 md:hidden">
      <button
        onClick={onConnect}
        className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-[var(--theme-accent)] hover:text-[var(--theme-bg)]"
        style={{
          color: 'var(--theme-accent)',
          borderColor: 'var(--theme-accent)',
        }}
      >
        <Bluetooth className="h-4 w-4" />
        <span>{isConnecting ? 'connecting...' : 'Connect Smart Cube'}</span>
      </button>
    </div>
  )
}

interface BatteryStatusProps {
  batteryLevel: number | null
  isConnected: boolean
  onOpenCubeInfo?: () => void
}

export function BatteryStatus({ batteryLevel, isConnected, onOpenCubeInfo }: BatteryStatusProps) {
  if (!isConnected) return null

  return (
    <button
      onClick={onOpenCubeInfo}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors hover:bg-[var(--theme-subAlt)]"
      style={{ color: batteryLevel !== null && batteryLevel <= 20 ? 'var(--theme-error)' : 'var(--theme-sub)' }}
    >
      {batteryLevel !== null && batteryLevel <= 20 ? (
        <BatteryWarning className="h-4 w-4" />
      ) : (
        <Battery className="h-4 w-4" />
      )}
      <span className="font-medium">{batteryLevel !== null ? `${batteryLevel}%` : '-'}</span>
    </button>
  )
}
