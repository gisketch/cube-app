import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

export function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = 'Delete Solve',
  message = 'Are you sure you want to delete this solve? This action cannot be undone.'
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-xl p-6"
        style={{ backgroundColor: 'var(--theme-bg)', border: '1px solid var(--theme-subAlt)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 transition-colors hover:opacity-80"
          style={{ color: 'var(--theme-sub)' }}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="mb-4 h-8 w-8" style={{ color: 'var(--theme-error)' }} />

          <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>
            {title}
          </h2>

          <p className="mb-6 text-sm" style={{ color: 'var(--theme-sub)' }}>
            {message}
          </p>

          <div className="flex w-full gap-3">
            <Button
              onClick={onClose}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: 'var(--theme-subAlt)', 
                color: 'var(--theme-text)' 
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: 'var(--theme-error)', 
                color: 'var(--theme-bg)' 
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
