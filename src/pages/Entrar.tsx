import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { hoy } from '../utils/formatters'

export function Entrar() {
  const { dispatch, state } = useApp()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!state.perfil?.onboardingCompletado) {
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
    // Wait one tick so the state update commits before we navigate
    setReady(true)
  }, [])

  if (ready) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#ffd600]/30 border-t-[#ffd600] rounded-full animate-spin" />
    </div>
  )
}
