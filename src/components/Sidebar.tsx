import { Timer, ListOrdered, Bluetooth, RefreshCw, Settings2, FlaskConical, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabType = 'timer' | 'solves' | 'simulator' | 'settings'

interface SidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  isConnected: boolean
  isConnecting: boolean
  onConnect: () => void
  onDisconnect: () => void
  onResetGyro?: () => void
  onCalibrate?: () => void
}

export function Sidebar({
  activeTab,
  onTabChange,
  isConnected,
  isConnecting,
  onConnect,
  onDisconnect,
  onResetGyro,
  onCalibrate,
}: SidebarProps) {
  const tabs = [
    { id: 'timer' as const, label: 'Timer', icon: Timer },
    { id: 'solves' as const, label: 'Solves', icon: ListOrdered },
    { id: 'simulator' as const, label: 'Simulator', icon: FlaskConical },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ]

  return (
    <aside 
      className="fixed left-0 top-0 z-40 flex h-full w-16 flex-col items-center py-4"
      style={{ 
        backgroundColor: 'var(--theme-bgSecondary)',
        borderRight: '1px solid var(--theme-subAlt)'
      }}
    >
      <div 
        className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'var(--theme-accent)' }}
      >
        <span className="text-lg font-bold" style={{ color: 'var(--theme-bg)' }}>C</span>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200',
              )}
              style={{
                backgroundColor: isActive ? 'var(--theme-subAlt)' : 'transparent',
                color: isActive ? 'var(--theme-text)' : 'var(--theme-sub)',
              }}
              title={tab.label}
            >
              <Icon className="h-5 w-5" />
              {isActive && (
                <div 
                  className="absolute left-0 h-6 w-1 rounded-r-full"
                  style={{ backgroundColor: 'var(--theme-accent)' }}
                />
              )}
            </button>
          )
        })}
      </nav>

      <div className="flex flex-col gap-2">
        {onCalibrate && (
          <button
            onClick={onCalibrate}
            disabled={!isConnected}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
            style={{
              color: isConnected ? 'var(--theme-sub)' : 'var(--theme-subAlt)',
              cursor: isConnected ? 'pointer' : 'not-allowed',
            }}
            title={isConnected ? 'Calibration' : 'Connect cube first'}
          >
            <Settings2 className="h-4 w-4" />
          </button>
        )}
        {isConnected && onResetGyro && (
          <button
            onClick={onResetGyro}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--theme-sub)' }}
            title="Reset Gyro"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isConnecting}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
            isConnected
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              : isConnecting
                ? 'animate-pulse bg-blue-500/20 text-blue-400'
                : '',
          )}
          style={!isConnected && !isConnecting ? { 
            backgroundColor: 'var(--theme-subAlt)', 
            color: 'var(--theme-sub)' 
          } : undefined}
          title={isConnected ? 'Disconnect Cube' : isConnecting ? 'Connecting...' : 'Connect Cube'}
        >
          <Bluetooth className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}
