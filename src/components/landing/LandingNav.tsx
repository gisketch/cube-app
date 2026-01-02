import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { getVersionString } from '@/lib/version'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Achievements', href: '#achievements' },
  { label: 'Leaderboard', href: '#leaderboard' },
  { label: 'Roadmap', href: '#roadmap' },
  { label: 'FAQ', href: '/faq' },
]

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      element?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(12, 10, 9, 0.8)',
        borderBottom: '1px solid var(--theme-sub-alt)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Kitsune Cube" className="h-8 w-8" />
          <span className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
            Kitsune Cube
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-bg)',
            }}
          >
            {getVersionString()}
          </span>
        </Link>

        <div className="hidden items-center gap-4 lg:gap-6 xl:gap-8 lg:flex">
          {NAV_LINKS.map((link) =>
            link.href.startsWith('/') ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: 'var(--theme-sub)' }}
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: 'var(--theme-sub)' }}
              >
                {link.label}
              </button>
            )
          )}

          <Link
            to="/app"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-bg)',
            }}
          >
            Open App →
          </Link>
        </div>

        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ color: 'var(--theme-text)' }}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          className="border-t px-6 py-4 lg:hidden"
          style={{
            backgroundColor: 'var(--theme-bg)',
            borderColor: 'var(--theme-sub-alt)',
          }}
        >
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) =>
              link.href.startsWith('/') ? (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm"
                  style={{ color: 'var(--theme-sub)' }}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="text-left text-sm"
                  style={{ color: 'var(--theme-sub)' }}
                >
                  {link.label}
                </button>
              )
            )}
            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-4 py-2 text-center text-sm font-medium"
              style={{
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-bg)',
              }}
            >
              Open App →
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
