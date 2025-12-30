import { Timer, ListOrdered, Bluetooth, RefreshCw, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabType = 'timer' | 'solves'

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
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-16 flex-col items-center border-r border-white/10 bg-black/40 py-4 backdrop-blur-xl">
      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-orange-500">
        <span className="text-lg font-bold text-white">C</span>
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
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80',
              )}
              title={tab.label}
            >
              <Icon className="h-5 w-5" />
              {isActive && (
                <div className="absolute left-0 h-6 w-1 rounded-r-full bg-gradient-to-b from-blue-500 to-orange-500" />
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
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
              isConnected
                ? 'text-white/50 hover:bg-white/5 hover:text-white/80'
                : 'cursor-not-allowed text-white/20',
            )}
            title={isConnected ? 'Calibration' : 'Connect cube first'}
          >
            <Settings2 className="h-4 w-4" />
          </button>
        )}
        {isConnected && onResetGyro && (
          <button
            onClick={onResetGyro}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
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
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80',
          )}
          title={isConnected ? 'Disconnect Cube' : isConnecting ? 'Connecting...' : 'Connect Cube'}
        >
          <Bluetooth className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}
