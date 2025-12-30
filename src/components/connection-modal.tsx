import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error'
  title: string
  message: string
  isMacRequired?: boolean
  onSubmitMac?: (mac: string) => void
}

export function ConnectionModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  isMacRequired,
  onSubmitMac,
}: ConnectionModalProps) {
  const [macAddress, setMacAddress] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    if (onSubmitMac && macAddress) {
      onSubmitMac(macAddress)
      setMacAddress('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="relative h-full w-full p-6 shadow-lg duration-200 animate-in fade-in zoom-in-95 md:h-auto md:max-w-md md:rounded-lg"
        style={{
          backgroundColor: 'var(--theme-bgSecondary)',
          border: '1px solid var(--theme-subAlt)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          style={{ color: 'var(--theme-sub)' }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2
              className="text-lg font-semibold leading-none tracking-tight"
              style={{ color: type === 'error' ? 'var(--theme-error)' : 'var(--theme-text)' }}
            >
              {title}
            </h2>
            <p className="text-sm" style={{ color: 'var(--theme-sub)' }}>
              {message}
            </p>
          </div>

          {isMacRequired && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="mac-address"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                style={{ color: 'var(--theme-text)' }}
              >
                MAC Address
              </label>
              <input
                id="mac-address"
                type="text"
                placeholder="E3:8C:8A:AB:0B:C9"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                className="flex h-10 w-full rounded-md px-3 py-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--theme-subAlt)',
                  color: 'var(--theme-text)',
                  border: '1px solid var(--theme-sub)',
                }}
              />
              <p className="text-xs" style={{ color: 'var(--theme-sub)' }}>
                Format: XX:XX:XX:XX:XX:XX
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {isMacRequired ? 'Cancel' : 'Close'}
            </Button>
            {isMacRequired && <Button onClick={handleSubmit}>Submit</Button>}
          </div>
        </div>
      </div>
    </div>
  )
}
