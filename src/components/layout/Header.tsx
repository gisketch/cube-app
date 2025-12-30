import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Settings,
  FlaskConical,
  History,
  ChevronDown,
  Bluetooth,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  BatteryWarning,
  RotateCcw,
  X,
  Menu,
} from 'lucide-react'

interface HeaderProps {
  onNavigate: (page: 'timer' | 'solves' | 'simulator' | 'settings') => void
  isConnected: boolean
  isConnecting: boolean
  onConnect: () => void
  onDisconnect: () => void
  batteryLevel: number | null
  onCalibrate?: () => void
}

export function Header({
  onNavigate,
  isConnected,
  isConnecting,
  onConnect,
  onDisconnect,
  batteryLevel,
  onCalibrate,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const getBatteryIcon = () => {
    if (batteryLevel === null) return Battery
    if (batteryLevel <= 10) return BatteryWarning
    if (batteryLevel <= 30) return BatteryLow
    if (batteryLevel <= 70) return BatteryMedium
    return BatteryFull
  }

  const BatteryIcon = getBatteryIcon()

  const menuItems = [
    { id: 'timer' as const, label: 'Timer', icon: RotateCcw },
    { id: 'solves' as const, label: 'Solve History', icon: History },
    { id: 'simulator' as const, label: 'Simulator', icon: FlaskConical },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ]

  const handleMobileNavigate = (page: 'timer' | 'solves' | 'simulator' | 'settings') => {
    onNavigate(page)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
        <button
          onClick={() => onNavigate('timer')}
          className="hidden items-center gap-2 text-xl font-semibold transition-colors md:flex"
          style={{ color: 'var(--theme-accent)' }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold"
            style={{ backgroundColor: 'var(--theme-accent)', color: 'var(--theme-bg)' }}
          >
            C
          </div>
          <span>gisketch's cube timer</span>
        </button>

        <button
          onClick={() => onNavigate('timer')}
          className="flex items-center gap-2 md:hidden"
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold"
            style={{ backgroundColor: 'var(--theme-accent)', color: 'var(--theme-bg)' }}
          >
            C
          </div>
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--theme-accent)' }}
          >
            Ghegi
          </span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-1 text-sm transition-colors md:hidden"
          style={{ color: 'var(--theme-text)' }}
        >
          <Menu className="h-5 w-5" style={{ color: 'var(--theme-sub)' }} />
        </button>

        <div
          className="relative hidden pb-2 md:block"
          ref={dropdownRef}
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-base transition-colors"
            style={{ color: 'var(--theme-text)' }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--theme-subAlt)' }}
            >
              <User className="h-4 w-4" />
            </div>
            <span>Ghegi</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <div
              className="absolute right-0 top-full z-50 w-52 rounded-lg py-1 shadow-lg"
              style={{
                backgroundColor: 'var(--theme-bgSecondary)',
                border: '1px solid var(--theme-subAlt)',
              }}
            >
              <div
                className="mb-1 px-3 py-2 text-sm font-medium uppercase"
                style={{ color: 'var(--theme-sub)' }}
              >
                Smart Cube
              </div>

              <button
                onClick={() => {
                  isConnected ? onDisconnect() : onConnect()
                  setIsDropdownOpen(false)
                }}
                disabled={isConnecting}
                className="flex w-full items-center gap-3 px-3 py-2 text-base transition-colors"
                style={{ color: isConnected ? '#4ade80' : 'var(--theme-text)' }}
              >
                <Bluetooth className={`h-4 w-4 ${isConnecting ? 'animate-pulse' : ''}`} />
                <span>
                  {isConnected ? 'Disconnect' : isConnecting ? 'Connecting...' : 'Connect Cube'}
                </span>
              </button>

              {isConnected && batteryLevel !== null && (
                <div
                  className="flex items-center gap-3 px-3 py-2 text-base"
                  style={{ color: batteryLevel <= 20 ? 'var(--theme-error)' : 'var(--theme-sub)' }}
                >
                  <BatteryIcon className="h-4 w-4" />
                  <span>{batteryLevel}%</span>
                </div>
              )}

              {isConnected && onCalibrate && (
                <button
                  onClick={() => {
                    onCalibrate()
                    setIsDropdownOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-base transition-colors hover:opacity-80"
                  style={{ color: 'var(--theme-text)' }}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Calibrate Cube</span>
                </button>
              )}

              <div className="my-1 h-px" style={{ backgroundColor: 'var(--theme-subAlt)' }} />

              <div
                className="mb-1 px-3 py-2 text-sm font-medium uppercase"
                style={{ color: 'var(--theme-sub)' }}
              >
                Navigation
              </div>

              {menuItems.slice(1).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    setIsDropdownOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-base transition-colors hover:opacity-80"
                  style={{ color: 'var(--theme-text)' }}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col md:hidden"
            style={{ backgroundColor: 'var(--theme-bg)' }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--theme-subAlt)' }}
                >
                  <User className="h-4 w-4" />
                </div>
                <span className="font-medium">Ghegi</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2"
                style={{ color: 'var(--theme-sub)' }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2 px-4 py-6">
              <div
                className="mb-2 text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--theme-sub)' }}
              >
                Navigation
              </div>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMobileNavigate(item.id)}
                  className="flex items-center gap-4 rounded-lg px-4 py-4 text-lg transition-colors"
                  style={{
                    color: 'var(--theme-text)',
                    backgroundColor: 'var(--theme-bgSecondary)',
                  }}
                >
                  <item.icon className="h-5 w-5" style={{ color: 'var(--theme-accent)' }} />
                  <span>{item.label}</span>
                </button>
              ))}

              <div className="my-4 h-px" style={{ backgroundColor: 'var(--theme-subAlt)' }} />

              <div
                className="mb-2 text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--theme-sub)' }}
              >
                Smart Cube
              </div>
              <button
                onClick={() => {
                  isConnected ? onDisconnect() : onConnect()
                  setIsMobileMenuOpen(false)
                }}
                disabled={isConnecting}
                className="flex items-center gap-4 rounded-lg px-4 py-4 text-lg transition-colors"
                style={{
                  color: isConnected ? '#4ade80' : 'var(--theme-text)',
                  backgroundColor: 'var(--theme-bgSecondary)',
                }}
              >
                <Bluetooth className={`h-5 w-5 ${isConnecting ? 'animate-pulse' : ''}`} />
                <span>
                  {isConnected ? 'Disconnect' : isConnecting ? 'Connecting...' : 'Connect Cube'}
                </span>
              </button>

              {isConnected && batteryLevel !== null && (
                <div
                  className="flex items-center gap-4 rounded-lg px-4 py-4 text-lg"
                  style={{
                    color: batteryLevel <= 20 ? 'var(--theme-error)' : 'var(--theme-sub)',
                    backgroundColor: 'var(--theme-bgSecondary)',
                  }}
                >
                  <BatteryIcon className="h-5 w-5" />
                  <span>Battery: {batteryLevel}%</span>
                </div>
              )}

              {isConnected && onCalibrate && (
                <button
                  onClick={() => {
                    onCalibrate()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-4 rounded-lg px-4 py-4 text-lg transition-colors"
                  style={{
                    color: 'var(--theme-text)',
                    backgroundColor: 'var(--theme-bgSecondary)',
                  }}
                >
                  <RotateCcw className="h-5 w-5" style={{ color: 'var(--theme-accent)' }} />
                  <span>Calibrate Cube</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
