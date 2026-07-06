const FLAME_PATH =
  'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'

interface StreakFlameProps {
  size?: number
  activa?: boolean
}

/** Llama animada estilo Duolingo con flicker + glow */
export function StreakFlame({ size = 120, activa = true }: StreakFlameProps) {
  return (
    <div className={activa ? 'flame-glow' : ''} style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd600" />
            <stop offset="55%" stopColor="#ff9500" />
            <stop offset="100%" stopColor="#ff5722" />
          </linearGradient>
        </defs>
        <path
          className={activa ? 'flame-flicker' : ''}
          d={FLAME_PATH}
          fill={activa ? 'url(#flameGrad)' : '#3f3f46'}
        />
        <g transform="translate(7.2, 10.2) scale(0.4)">
          <path
            className={activa ? 'flame-flicker-fast' : ''}
            d={FLAME_PATH}
            fill={activa ? '#fff3b0' : '#52525b'}
            opacity={activa ? 0.95 : 0.5}
          />
        </g>
      </svg>
    </div>
  )
}
