# cima — Personal Finance + Streak App

React + TypeScript PWA. Finance tracker (ingresos/gastos/presupuestos) with gamified streak system.
Formerly called RachaFin — renamed to cima but localStorage key may still be `rachafin-v1`.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + Lucide React + Sonner (toasts)
- Recharts (charts)
- localStorage persistence (key: `rachafin-v1` — verified in production)
- date-fns for date handling

## Entry Point

```bash
npm run dev     # dev server (localhost:5173)
npm run build   # production build
npm run lint    # ESLint
```

Or use `init.sh` to verify deps + build.

## Project Structure

```
src/
├── components/   # Shared UI components
├── hooks/        # useInstallPrompt, etc.
├── pages/        # Home, Transacciones, Presupuestos, Racha, Habitos, Tareas, Temporada, Semanal, Onboarding
├── store/        # AppContext + useReducer state
├── types/        # TypeScript interfaces
└── utils/        # xp.ts (XP/gamification), streakLogic.ts, formatearMonto()
```

## Data Model (localStorage)

All amounts stored as positive numbers. `tipo: "ingreso" | "gasto"` determines sign.
Key: `rachafin-v1` (do NOT change without migration).

## Critical Rules

- All amounts stored as positive; `tipo` field determines sign — don't invert this
- Don't change localStorage key `rachafin-v1` without writing a migration
- `streakLogic.ts` is the source of truth for streak/racha calculation
- Target audience: Spanish-speaking market (Mentes Millonarias platform)
- PWA is enabled — `public/manifest.json` + `display: standalone`

## Key Files

| File | Purpose |
|------|---------|
| `src/store/` | AppContext + useReducer — global state |
| `src/utils/streakLogic.ts` | calcularRacha, calcularRachaMaxima, ultimos30Dias |
| `src/utils/xp.ts` | XP / gamification layer |
| `src/pages/Transacciones.tsx` | Transaction CRUD (modal: bottom-sheet mobile / centered desktop) |
| `src/pages/Presupuestos.tsx` | Budget tracking with progress bars |
| `src/pages/Home.tsx` | Dashboard — balance, summary, Recharts charts |
| `src/pages/Racha.tsx` | Streak page — main gamification view |

## Verification Commands

```bash
npm run build    # zero TypeScript errors = passing
npm run lint     # ESLint check
npm run dev      # visual test at localhost:5173
```

## Definition of Done

- [ ] `npm run build` passes with 0 TypeScript errors
- [ ] Transaction CRUD flow works on mobile (bottom-sheet) and desktop (dialog)
- [ ] Streak logic shows correct racha on Home and Racha pages
- [ ] Data survives page refresh (localStorage persistence)

## Scope

- No backend — localStorage only for now. Don't add a server without Alejo's instruction.
- Recharts chunk size warning is non-blocking — cosmetic only
- `public/manifest.json` already has `display: standalone` — PWA is 90% done
