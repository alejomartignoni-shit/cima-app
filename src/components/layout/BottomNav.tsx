import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Home, ArrowLeftRight, Gift, Settings, Flame } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { calcularRacha } from '../../utils/streakLogic'
import { playPop, vibrate } from '../../utils/sound'

const itemsIzquierda = [
  { to: '/', icon: Home, label: 'Inicio', exact: true },
  { to: '/transacciones', icon: ArrowLeftRight, label: 'Finanzas' },
]

const itemsDerecha = [
  { to: '/recompensas', icon: Gift, label: 'Premios' },
  { to: '/configuracion', icon: Settings, label: 'Config' },
]

function NavItem({ to, icon: Icon, label, exact }: { to: string; icon: typeof Home; label: string; exact?: boolean }) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={() => vibrate(8)}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-colors ${
          isActive ? 'text-[#ffd600]' : 'text-zinc-500'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'animate-pop' : ''}>
            <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
          </span>
          <span className="text-[10px] font-bold">{label}</span>
          <span className={`w-1 h-1 rounded-full transition-all ${isActive ? 'bg-[#ffd600]' : 'bg-transparent'}`} />
        </>
      )}
    </NavLink>
  )
}

export function BottomNav() {
  const { state } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const racha = calcularRacha(state.diasActivos, state.transacciones)
  const enRacha = location.pathname === '/racha'

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 safe-area-pb pointer-events-none">
      <div className="pointer-events-auto relative flex items-stretch h-[68px] rounded-3xl bg-zinc-900/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {itemsIzquierda.map(item => <NavItem key={item.to} {...item} />)}

        {/* Botón central de Racha — elevado, estilo acción principal */}
        <div className="relative flex-1 flex justify-center">
          <button
            onClick={() => { playPop(); vibrate(12); navigate('/racha') }}
            aria-label="Racha"
            className={`absolute -top-6 w-[60px] h-[60px] rounded-full flex flex-col items-center justify-center transition-transform active:scale-90 ${
              racha > 0 ? 'animate-ring-pulse' : ''
            }`}
            style={{
              background: enRacha || racha > 0
                ? 'linear-gradient(160deg, #ffd600 0%, #ff9500 100%)'
                : 'linear-gradient(160deg, #3f3f46 0%, #27272a 100%)',
              boxShadow: racha > 0
                ? '0 4px 0 #a86400, 0 8px 28px rgba(255,170,0,0.35)'
                : '0 4px 0 #131316, 0 8px 20px rgba(0,0,0,0.5)',
            }}
          >
            <Flame
              size={26}
              className={racha > 0 || enRacha ? 'text-zinc-950' : 'text-zinc-500'}
              fill={racha > 0 ? '#1c1600' : 'none'}
            />
            {racha > 0 && (
              <span className="text-zinc-950 text-[11px] font-black leading-none -mt-0.5">{racha}</span>
            )}
          </button>
          <span className={`self-end pb-1.5 text-[10px] font-bold ${enRacha ? 'text-[#ffd600]' : 'text-zinc-500'}`}>
            Racha
          </span>
        </div>

        {itemsDerecha.map(item => <NavItem key={item.to} {...item} />)}
      </div>
    </nav>
  )
}
