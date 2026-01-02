import { Link, useLocation } from 'react-router-dom'
import { Construction, ArrowLeft, Home } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
  '/changelog': 'Changelog',
  '/docs': 'Documentation',
}

export function InProgressPage() {
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] || 'Page'

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-20"
      style={{ backgroundColor: 'var(--theme-bg)' }}
    >
      <div className="mx-auto max-w-md text-center">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--theme-bgSecondary)' }}
        >
          <Construction className="h-10 w-10" style={{ color: 'var(--theme-accent)' }} />
        </div>

        <h1
          className="mb-4 text-3xl font-bold"
          style={{ color: 'var(--theme-text)' }}
        >
          {pageTitle}
        </h1>

        <p
          className="mb-8 text-lg"
          style={{ color: 'var(--theme-sub)' }}
        >
          This page is currently under construction. Check back soon!
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-bg)',
            }}
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-lg border px-6 py-3 font-medium transition-all hover:opacity-80"
            style={{
              borderColor: 'var(--theme-subAlt)',
              color: 'var(--theme-text)',
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
