import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider, useApp } from './store/AppContext'
import { Home } from './pages/Home'
import { Transacciones } from './pages/Transacciones'
import { Racha } from './pages/Racha'
import { Presupuestos } from './pages/Presupuestos'
import { Configuracion } from './pages/Configuracion'
import { Habitos } from './pages/Habitos'
import { Tareas } from './pages/Tareas'
import { Semanal } from './pages/Semanal'
import { Temporada } from './pages/Temporada'
import { Onboarding } from './pages/Onboarding'

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { state } = useApp()
  if (!state.perfil?.onboardingCompletado) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<OnboardingGuard><Home /></OnboardingGuard>} />
      <Route path="/transacciones" element={<OnboardingGuard><Transacciones /></OnboardingGuard>} />
      <Route path="/racha" element={<OnboardingGuard><Racha /></OnboardingGuard>} />
      <Route path="/presupuestos" element={<OnboardingGuard><Presupuestos /></OnboardingGuard>} />
      <Route path="/habitos" element={<OnboardingGuard><Habitos /></OnboardingGuard>} />
      <Route path="/tareas" element={<OnboardingGuard><Tareas /></OnboardingGuard>} />
      <Route path="/semanal" element={<OnboardingGuard><Semanal /></OnboardingGuard>} />
      <Route path="/temporada" element={<OnboardingGuard><Temporada /></OnboardingGuard>} />
      <Route path="/configuracion" element={<OnboardingGuard><Configuracion /></OnboardingGuard>} />
    </Routes>
  )
}

export function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid #27272a',
            color: '#f4f4f5',
          },
        }}
      />
    </AppProvider>
  )
}
