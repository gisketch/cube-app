import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from '@/App'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { ExperienceProvider } from '@/contexts/ExperienceContext'
import { AchievementsProvider } from '@/contexts/AchievementsContext'
import { GoalsProvider } from '@/contexts/GoalsContext'
import { SolveSessionProvider } from '@/contexts/SolveSessionContext'
import { ErrorBoundary } from '@/components/error-boundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <ExperienceProvider>
              <AchievementsProvider>
                <GoalsProvider>
                  <SolveSessionProvider>
                    <App />
                  </SolveSessionProvider>
                </GoalsProvider>
              </AchievementsProvider>
            </ExperienceProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
