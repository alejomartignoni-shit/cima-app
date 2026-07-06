import { Component, type ReactNode, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider, useApp } from './store/AppContext'
import { ThemeProvider } from './store/ThemeContext'
import { hoy } from './utils/formatters'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#f87171', fontFamily: 'monospace', background: '#09090b', minHeight: '100vh' }}>
          <h2 style={{ color: '#fbbf24', marginBottom: 12 }}>Runtime Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{String(this.state.error)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
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
import { Proyeccion } from './pages/Proyeccion'
import { Dashboards } from './pages/Dashboards'
import { Recompensas } from './pages/Recompensas'
import { CostosFijos } from './pages/CostosFijos'
import { Inversiones } from './pages/Inversiones'
import { Ahorros } from './pages/Ahorros'
import { Cashflow } from './pages/Cashflow'
import { Negocios } from './pages/Negocios'
import { Landing } from './pages/Landing'
import { Ventas } from './pages/Ventas'
import { Entrar } from './pages/Entrar'

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useApp()

  useEffect(() => {
    if (!state.perfil?.onboardingCompletado) {
      dispatch({
        type: 'COMPLETAR_ONBOARDING',
        payload: {
          nombre: 'Usuario', objetivo: 'controlar', obstaculo: '',
          intereses: [], onboardingCompletado: true, creadoEn: hoy(),
        },
      })
    }
  }, [])

  if (!state.perfil?.onboardingCompletado) {
    return <div className="min-h-screen bg-zinc-950" />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/pro" element={<Ventas />} />
      <Route path="/entrar" element={<Entrar />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<OnboardingGuard><Home /></OnboardingGuard>} />
      <Route path="/transacciones" element={<OnboardingGuard><Transacciones /></OnboardingGuard>} />
      <Route path="/racha" element={<OnboardingGuard><Racha /></OnboardingGuard>} />
      <Route path="/presupuestos" element={<OnboardingGuard><Presupuestos /></OnboardingGuard>} />
      <Route path="/costos-fijos" element={<OnboardingGuard><CostosFijos /></OnboardingGuard>} />
      <Route path="/inversiones" element={<OnboardingGuard><Inversiones /></OnboardingGuard>} />
      <Route path="/ahorros" element={<OnboardingGuard><Ahorros /></OnboardingGuard>} />
      <Route path="/cashflow" element={<OnboardingGuard><Cashflow /></OnboardingGuard>} />
      <Route path="/negocios" element={<OnboardingGuard><Negocios /></OnboardingGuard>} />
      <Route path="/habitos" element={<OnboardingGuard><Habitos /></OnboardingGuard>} />
      <Route path="/tareas" element={<OnboardingGuard><Tareas /></OnboardingGuard>} />
      <Route path="/semanal" element={<OnboardingGuard><Semanal /></OnboardingGuard>} />
      <Route path="/temporada" element={<OnboardingGuard><Temporada /></OnboardingGuard>} />
      <Route path="/proyeccion" element={<OnboardingGuard><Proyeccion /></OnboardingGuard>} />
      <Route path="/configuracion" element={<OnboardingGuard><Configuracion /></OnboardingGuard>} />
      <Route path="/dashboards" element={<OnboardingGuard><Dashboards /></OnboardingGuard>} />
      <Route path="/recompensas" element={<OnboardingGuard><Recompensas /></OnboardingGuard>} />
    </Routes>
  )
}

export function App() {
  return (
    <ErrorBoundary>
    <ThemeProvider>
      <AppProvider>
        <HashRouter>
          <ErrorBoundary>
          <AppRoutes />
          </ErrorBoundary>
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
    </ThemeProvider>
    </ErrorBoundary>
  )
}
