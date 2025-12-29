import { NavLink, Route, Routes } from 'react-router-dom'

import { ModeToggle } from '@/components/mode-toggle'
import { cn } from '@/lib/utils'
import AboutPage from '@/pages/About'
import HomePage from '@/pages/Home'
import NotFoundPage from '@/pages/NotFound'

function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <nav className="flex items-center gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )
              }
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              About
            </NavLink>
          </nav>
          <ModeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
