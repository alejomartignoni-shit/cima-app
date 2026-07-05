import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { hoy } from '../utils/formatters'

export function Entrar() {
  const { dispatch, state } = useApp()
  const onboarded = state.perfil?.onboardingCompletado

  useEffect(() => {
    if (!onboarded) {
      dispatch({
        type: 'COMPLETAR_ONBOARDING',
        payload: {
          nombre: 'Usuario',
          objetivo: 'controlar',
          obstaculo: '',
          intereses: [],
          onboardingCompletado: true,
          creadoEn: hoy(),
        },
      })
    }
  }, [])

  // Only navigate after we can OBSERVE onboardingCompletado = true in the context.
  // This guarantees OnboardingGuard at "/" won't see stale state.
  if (onboarded) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#ffd600]/30 border-t-[#ffd600] rounded-full animate-spin" />
    </div>
  )
}
