import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

type AuthMode = 'login' | 'register' | 'reset'

const MAX_NAME_LENGTH = 20
const VALID_NAME_REGEX = /^[a-zA-Z0-9_\- ]+$/

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  
  const { signInWithGoogle, signInWithEmail, registerWithEmail, resetPassword } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setDisplayName('')
    setError(null)
    setShowPassword(false)
  }

  const handleClose = () => {
    resetForm()
    setMode('login')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
        showToast('Signed in successfully!')
        handleClose()
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          setLoading(false)
          return
        }
        const trimmedName = displayName.trim()
        if (trimmedName && trimmedName.length > MAX_NAME_LENGTH) {
          setError(`Name must be ${MAX_NAME_LENGTH} characters or less`)
          setLoading(false)
          return
        }
        if (trimmedName && !VALID_NAME_REGEX.test(trimmedName)) {
          setError('Name can only contain letters, numbers, spaces, hyphens, and underscores')
          setLoading(false)
          return
        }
        await registerWithEmail(email, password, trimmedName || undefined)
        showToast('Account created successfully!')
        handleClose()
      } else if (mode === 'reset') {
        await resetPassword(email)
        showToast('Password reset email sent!')
        setMode('login')
        setEmail('')
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      const errorMessages: Record<string, string> = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'An account already exists with this email',
        'auth/weak-password': 'Password is too weak',
        'auth/invalid-credential': 'Invalid email or password',
      }
      setError(errorMessages[error.code || ''] || error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      handleClose()
    } catch {
      setError('Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <motion.div
            ref={modalRef}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 pb-safe shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--theme-bg)' }}
          >
            <button
              ref={closeButtonRef}
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-lg p-2 transition-colors hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ color: 'var(--theme-sub)' }}
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 pr-8">
              {mode !== 'login' && (
                <button
                  onClick={() => { setMode('login'); setError(null) }}
                  className="mb-4 flex items-center gap-1 text-sm transition-colors hover:opacity-70 focus:outline-none focus:underline"
                  style={{ color: 'var(--theme-sub)' }}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back to sign in
                </button>
              )}
              <h2 id="auth-modal-title" className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'reset' && 'Reset Password'}
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--theme-sub)' }}>
                {mode === 'login' && 'Sign in to sync your solves across devices'}
                {mode === 'register' && 'Create an account to get started'}
                {mode === 'reset' && 'Enter your email to receive a reset link'}
              </p>
            </div>

            <div 
              role="alert"
              aria-live="polite"
              className={`mb-4 rounded-lg px-4 py-3 text-sm ${error ? 'block' : 'hidden'}`}
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
            >
              {error}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label htmlFor="auth-display-name" className="mb-1 block text-sm font-medium" style={{ color: 'var(--theme-sub)' }}>
                    Display Name (optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--theme-sub)' }} aria-hidden="true" />
                    <input
                      id="auth-display-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      className="w-full rounded-lg border py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-current focus:ring-2 focus:ring-offset-1"
                      style={{ 
                        backgroundColor: 'var(--theme-subAlt)', 
                        borderColor: 'var(--theme-subAlt)',
                        color: 'var(--theme-text)'
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="mb-1 block text-sm font-medium" style={{ color: 'var(--theme-sub)' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--theme-sub)' }} aria-hidden="true" />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-current focus:ring-2 focus:ring-offset-1"
                    style={{ 
                      backgroundColor: 'var(--theme-subAlt)', 
                      borderColor: 'var(--theme-subAlt)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <label htmlFor="auth-password" className="mb-1 block text-sm font-medium" style={{ color: 'var(--theme-sub)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--theme-sub)' }} aria-hidden="true" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className="w-full rounded-lg border py-3 pl-10 pr-12 text-sm outline-none transition-colors focus:border-current focus:ring-2 focus:ring-offset-1"
                      style={{ 
                        backgroundColor: 'var(--theme-subAlt)', 
                        borderColor: 'var(--theme-subAlt)',
                        color: 'var(--theme-text)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 focus:outline-none focus:ring-2 rounded"
                      style={{ color: 'var(--theme-sub)' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label htmlFor="auth-confirm-password" className="mb-1 block text-sm font-medium" style={{ color: 'var(--theme-sub)' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--theme-sub)' }} aria-hidden="true" />
                    <input
                      id="auth-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full rounded-lg border py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-current focus:ring-2 focus:ring-offset-1"
                      style={{ 
                        backgroundColor: 'var(--theme-subAlt)', 
                        borderColor: 'var(--theme-subAlt)',
                        color: 'var(--theme-text)'
                      }}
                    />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setMode('reset'); setError(null) }}
                  className="text-sm transition-colors hover:opacity-70"
                  style={{ color: 'var(--theme-accent)' }}
                >
                  Forgot password?
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--theme-accent)', color: 'var(--theme-bg)' }}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'reset' && 'Send Reset Link'}
                  </>
                )}
              </button>
            </form>

            {mode === 'login' && (
              <>
                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1" style={{ backgroundColor: 'var(--theme-subAlt)' }} />
                  <span className="text-xs uppercase" style={{ color: 'var(--theme-sub)' }}>or</span>
                  <div className="h-px flex-1" style={{ backgroundColor: 'var(--theme-subAlt)' }} />
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border py-3 font-medium transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ 
                    borderColor: 'var(--theme-subAlt)', 
                    color: 'var(--theme-text)',
                    backgroundColor: 'transparent'
                  }}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <p className="mt-6 text-center text-sm" style={{ color: 'var(--theme-sub)' }}>
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setMode('register'); setError(null) }}
                    className="font-medium transition-colors hover:opacity-70"
                    style={{ color: 'var(--theme-accent)' }}
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}

            {mode === 'register' && (
              <p className="mt-6 text-center text-sm" style={{ color: 'var(--theme-sub)' }}>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(null) }}
                  className="font-medium transition-colors hover:opacity-70"
                  style={{ color: 'var(--theme-accent)' }}
                >
                  Sign in
                </button>
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
