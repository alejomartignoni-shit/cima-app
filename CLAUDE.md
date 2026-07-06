# CIMA — CLAUDE.md

## Proyecto

App de finanzas personales gamificada, orientada al mercado hispanohablante. Se lanza en la plataforma **Mentes Millonarias** con el objetivo de ayudar a los usuarios a alcanzar la libertad financiera más rápido. El diferencial es el sistema de racha (streak) que convierte el hábito financiero en algo motivador, similar a Duolingo pero para el dinero.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** — dark theme, paleta zinc
- **React Router v6** — SPA con 5 rutas
- **Recharts** — gráficos de gastos/ingresos
- **date-fns** — todas las operaciones de fecha (locale `es`)
- **Lucide React** — iconografía
- **Sonner** — toasts
- **localStorage** — persistencia (`cima-v1`)
- **PWA** — `public/manifest.json`

## Arquitectura

```
src/
├── types/index.ts          # Todos los tipos del dominio (única fuente de verdad)
├── store/AppContext.tsx     # Estado global: Context + useReducer + localStorage sync
├── utils/
│   ├── formatters.ts       # Moneda ARS, fechas en español, helpers hoy()/mesActual()
│   ├── streakLogic.ts      # Lógica de racha: calcularRacha, calcularRachaMaxima, ultimos30Dias
│   └── demoData.ts         # Datos de demostración
├── hooks/
│   └── useMediaQuery.ts    # Responsive breakpoints
├── components/layout/
│   ├── AppLayout.tsx       # Wrapper: Sidebar (desktop) + BottomNav (mobile) + TopHeader
│   ├── Sidebar.tsx         # Nav lateral lg+
│   ├── BottomNav.tsx       # Nav inferior mobile
│   └── TopHeader.tsx       # Header con título de página
└── pages/
    ├── Home.tsx            # Dashboard principal: balance, resumen mes, accesos rápidos
    ├── Transacciones.tsx   # Lista + CRUD de transacciones
    ├── Racha.tsx           # Sistema de streak + check-in diario + logros
    ├── Presupuestos.tsx    # Presupuestos por categoría/mes con barra de progreso
    └── Configuracion.tsx   # Reset, cargar demo, preferencias
```

## Dominio

### Tipos clave (`src/types/index.ts`)
- `Transaccion` — id, fecha (YYYY-MM-DD), tipo (ingreso|gasto), categoria, monto (siempre positivo), nota
- `Presupuesto` — id, categoriaGasto, monto, mes (YYYY-MM)
- `DiaActivo` — fecha, porTransaccion (bool), porCheckIn (bool)
- `Logro` — id, nombre, descripcion, icono, desbloqueadoEn
- `AppState` — todo el estado de la app

### Estado global
El reducer en `AppContext.tsx` es la única forma de mutar el estado. Acceso: `useApp()` hook. Persiste en `localStorage` en cada cambio de estado.

### Sistema de Racha
Un día cuenta como activo si tiene al menos una transacción **O** un check-in. La racha se calcula hacia atrás desde hoy (`calcularRacha`). El check-in diario es la válvula de escape para días sin transacciones.

### Moneda
ARS (pesos argentinos). Formatear siempre con `formatearMonto()` de `formatters.ts`. Nunca hardcodear el símbolo.

## Convenciones

- **Idioma del código**: inglés para nombres de variables/funciones internas, español para texto visible al usuario y para nombres del dominio (`Transaccion`, `Presupuesto`, `DiaActivo`, etc.)
- **Componentes**: PascalCase, named exports (no default exports)
- **Fechas**: siempre `YYYY-MM-DD` en el estado; usar `date-fns` con `{ locale: es }` para display
- **IDs**: `crypto.randomUUID()` o `Date.now().toString()`
- **Montos**: siempre número positivo en el estado; el tipo (`ingreso`/`gasto`) determina el signo
- **Sin comentarios obvios**: solo cuando el porqué no es evidente

## Comandos

```bash
npm run dev       # Servidor de desarrollo (Vite)
npm run build     # TypeScript check + build producción
npm run preview   # Preview del build
npm run lint      # ESLint
```

## UI / Design

- Dark-first: fondo `zinc-950`, cards `zinc-900`, bordes `zinc-800`
- **Estilo: Duolingo × Phantom** — base dark sleek con acento violeta (`#7c5cfc`/`#ab9ff2`) + juice de juego (oro `#ffd600` para XP/racha)
- Acento positivo: `emerald-500` (ingresos), negativo: `rose-500` (gastos, alertas)
- Cards principales `rounded-3xl`; hero cards con clases `card-hero` (violeta) y `card-hero-flame` (fuego)
- Animaciones: `animate-pop` (bounce), `animate-fade-in` en páginas, `flame-flicker`, confetti
- Responsive: mobile-first con `lg:` para desktop. Bottom nav flotante en mobile (botón central de Racha elevado), sidebar en lg+

## Game Feel Layer (`src/components/game/`)

- **`GameFeedback.tsx`** — watcher global montado en `AppLayout`. Detecta subas de XP (delta ≤ 100 = acción de usuario; delta mayor = carga demo, se ignora) → toast +XP, ding, vibración. Detecta suba de rango → confetti + fanfarria + `LevelUpModal`.
- **`JuicyButton.tsx`** — botón 3D estilo Duolingo (`btn-juicy btn-juicy-{gold|emerald|violet|dark}` en `index.css`). Press físico de 4px, pop + háptica.
- **`Celebration.tsx`** — confetti global. `celebrate({ pieces })` desde cualquier lado (CustomEvent `cima:celebrate`). Se monta una sola vez vía `GameFeedback`.
- **`CountUp.tsx`** — números animados (balance del Home).
- **`StreakFlame.tsx`** — llama SVG animada con flicker + glow.
- **`QuestCard.tsx`** — misiones del día (transacción, check-in, hábito). 100% derivadas del estado, sin persistencia extra.
- **`src/utils/sound.ts`** — sonidos sintetizados con WebAudio (sin assets): `playDing`, `playPop`, `playFanfare`, `vibrate`. Toggle en Configuración (localStorage `cima-sonidos`).

## Lo que NO hacer

- No romper la lógica de racha sin entender `streakLogic.ts` completo
- No agregar librerías de estado (Zustand, Redux) — el Context + useReducer es suficiente
- No cambiar el formato de fechas en el estado (YYYY-MM-DD es un invariante)
- No agregar `console.log` en producción
- No cambiar `STORAGE_KEY` sin manejar migración de datos existentes
- No usar `default export` en componentes — todos son named exports
