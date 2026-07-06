import { type ButtonHTMLAttributes } from 'react'
import { playPop, vibrate } from '../../utils/sound'

type Variante = 'gold' | 'emerald' | 'violet' | 'dark'

interface JuicyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variante
  fullWidth?: boolean
  /** No reproducir pop/vibración al tocar */
  silent?: boolean
}

/** Botón 3D estilo Duolingo: edge inferior + press físico + pop + háptica */
export function JuicyButton({
  variant = 'gold',
  fullWidth = false,
  silent = false,
  className = '',
  onClick,
  children,
  ...rest
}: JuicyButtonProps) {
  return (
    <button
      className={`btn-juicy btn-juicy-${variant} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={e => {
        if (!silent && !rest.disabled) {
          playPop()
          vibrate(10)
        }
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
