import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { hoy } from '../utils/formatters'

// Direct-access route — skips onboarding, goes straight to dashboard.
// Use this link to share the app with people who don't need the sales flow.
export function Entrar() {
  const { dispatch, state } = useApp()
  const navigate = useNavigate()

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
    navigate('/', { replace: true })
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#ffd600]/30 border-t-[#ffd600] rounded-full animate-spin" />
    </div>
  )
}
