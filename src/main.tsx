import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { ExperienceProvider } from '@/contexts/ExperienceContext'
import { AchievementsProvider } from '@/contexts/AchievementsContext'
import { SolveSessionProvider } from '@/contexts/SolveSessionContext'
import { ErrorBoundary } from '@/components/error-boundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <ExperienceProvider>
            <AchievementsProvider>
              <SolveSessionProvider>
                <App />
              </SolveSessionProvider>
            </AchievementsProvider>
          </ExperienceProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
