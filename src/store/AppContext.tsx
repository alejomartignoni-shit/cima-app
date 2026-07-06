import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { AppState, AppAction, DiaSemana, EstadoXP, EventoXP, EstadoCreditos, CreditoEvento, PrioridadTarea } from '../types'
import { hoy } from '../utils/formatters'
import { agregarXP, crearEventoXP } from '../utils/xp'
import { applyLogros } from '../utils/logros'

const STORAGE_KEY = 'cima-v1'

const xpInicial: EstadoXP = { total: 0, historial: [] }
const creditosInicial: EstadoCreditos = { total: 0, historial: [] }

const estadoInicial: AppState = {
  transacciones: [],
  presupuestos: [],
  diasActivos: [],
  logros: [],
  ultimoCheckIn: null,
  habitos: [],
  registrosHabito: [],
  estadosDia: [],
  tareas: [],
  registrosSemanal: [],
  deudas: [],
  costosFijos: [],
  inversiones: [],
  fondos: [],
  activos: [],
  negocios: [],
  transaccionesNegocio: [],
  presupuestosNegocio: [],
  dashboards: [],
  perfil: null,
  xp: xpInicial,
  creditos: creditosInicial,
}

const CREDITOS = {
  checkin: 10,
  transaccion: 3,
  habito: 2,
  diario: 5,
  onboarding: 50,
  tarea: { Alta: 20, Media: 10, Baja: 5, Opcional: 2 } as Record<PrioridadTarea, number>,
}

function addCredito(creditos: EstadoCreditos, evento: CreditoEvento): EstadoCreditos {
  return {
    total: creditos.total + evento.cantidad,
    historial: [...creditos.historial.slice(-99), evento],
  }
}

function cargarEstado(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return estadoInicial
    const loaded: AppState = { ...estadoInicial, ...JSON.parse(raw) }
    if (!loaded.perfil && loaded.transacciones.length > 0) {
      loaded.perfil = {
        nombre: 'Usuario',
        objetivo: 'controlar',
        obstaculo: '',
        intereses: [],
        onboardingCompletado: true,
        creadoEn: hoy(),
      }
    }
    return loaded
  } catch {
    return estadoInicial
  }
}

function upsertDiaSemanal(
  registros: AppState['registrosSemanal'],
  semana: string,
  fecha: string,
  dia: DiaSemana
): AppState['registrosSemanal'] {
  const existente = registros.find(r => r.semana === semana)
  if (existente) {
    return registros.map(r =>
      r.semana === semana
        ? { ...r, dias: { ...r.dias, [fecha]: dia } }
        : r
    )
  }
  return [...registros, { semana, dias: { [fecha]: dia } }]
}

const XP_POR_PRIORIDAD: Record<PrioridadTarea, string> = {
  Alta: 'tarea_alta',
  Media: 'tarea_media',
  Baja: 'tarea_baja',
  Opcional: 'tarea_opcional',
}

function reducerCore(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TRANSACCION': {
      const fechaTx = action.payload.fecha
      const yaTieneDia = state.diasActivos.some(d => d.fecha === fechaTx)
      const nuevasDias = yaTieneDia
        ? state.diasActivos
        : [...state.diasActivos, { fecha: fechaTx, porTransaccion: true, porCheckIn: false }]
      const evento = crearEventoXP('transaccion', fechaTx)
      return {
        ...state,
        transacciones: [...state.transacciones, action.payload],
        diasActivos: nuevasDias,
        xp: agregarXP(state.xp, evento),
        creditos: addCredito(state.creditos, { fecha: fechaTx, cantidad: CREDITOS.transaccion, motivo: 'Transacción registrada' }),
      }
    }

    case 'EDIT_TRANSACCION':
      return {
        ...state,
        transacciones: state.transacciones.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      }

    case 'DELETE_TRANSACCION':
      return {
        ...state,
        transacciones: state.transacciones.filter(t => t.id !== action.payload),
      }

    case 'ADD_PRESUPUESTO':
      return { ...state, presupuestos: [...state.presupuestos, action.payload] }

    case 'EDIT_PRESUPUESTO':
      return {
        ...state,
        presupuestos: state.presupuestos.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      }

    case 'DELETE_PRESUPUESTO':
      return {
        ...state,
        presupuestos: state.presupuestos.filter(p => p.id !== action.payload),
      }

    case 'CARGAR_DEMO': {
      const xpFromDemo = action.payload.xpEvents ?? []
      const xpTotal = xpFromDemo.reduce((s, e) => s + e.cantidad, 0)
      return {
        ...state,
        transacciones: action.payload.transacciones,
        diasActivos: action.payload.diasActivos,
        deudas: action.payload.deudas ?? state.deudas,
        presupuestos: action.payload.presupuestos ?? state.presupuestos,
        habitos: action.payload.habitos ?? state.habitos,
        registrosHabito: action.payload.registrosHabito ?? state.registrosHabito,
        estadosDia: action.payload.estadosDia ?? state.estadosDia,
        tareas: action.payload.tareas ?? state.tareas,
        registrosSemanal: action.payload.registrosSemanal ?? state.registrosSemanal,
        perfil: action.payload.perfil ?? state.perfil,
        ultimoCheckIn: action.payload.ultimoCheckIn ?? state.ultimoCheckIn,
        dashboards: action.payload.dashboards ?? state.dashboards,
        logros: action.payload.logros ?? state.logros,
        creditos: action.payload.creditos ?? state.creditos,
        costosFijos: action.payload.costosFijos ?? state.costosFijos,
        inversiones: action.payload.inversiones ?? state.inversiones,
        fondos: action.payload.fondos ?? state.fondos,
        activos: action.payload.activos ?? state.activos,
        negocios: action.payload.negocios ?? state.negocios,
        transaccionesNegocio: action.payload.transaccionesNegocio ?? state.transaccionesNegocio,
        presupuestosNegocio: action.payload.presupuestosNegocio ?? state.presupuestosNegocio,
        xp: xpFromDemo.length > 0
          ? { total: xpTotal, historial: xpFromDemo.slice(-100) }
          : state.xp,
      }
    }

    case 'ADD_DIA_ACTIVO': {
      const existe = state.diasActivos.some(d => d.fecha === action.payload.fecha)
      if (existe) return state
      return { ...state, diasActivos: [...state.diasActivos, action.payload] }
    }

    case 'CHECKIN_HOY': {
      const fechaHoy = hoy()
      const yaTieneDia = state.diasActivos.some(d => d.fecha === fechaHoy)
      const nuevasDias = yaTieneDia
        ? state.diasActivos.map(d =>
            d.fecha === fechaHoy ? { ...d, porCheckIn: true } : d
          )
        : [...state.diasActivos, { fecha: fechaHoy, porTransaccion: false, porCheckIn: true }]
      const evento = crearEventoXP('checkin', fechaHoy)
      return {
        ...state,
        diasActivos: nuevasDias,
        ultimoCheckIn: action.payload,
        xp: agregarXP(state.xp, evento),
        creditos: addCredito(state.creditos, { fecha: fechaHoy, cantidad: CREDITOS.checkin, motivo: 'Check-in diario' }),
      }
    }

    case 'DESBLOQUEAR_LOGRO': {
      const yaDesbloqueado = state.logros.some(l => l.id === action.payload.id)
      if (yaDesbloqueado) return state
      return { ...state, logros: [...state.logros, action.payload] }
    }

    case 'RESET_DATOS':
      return estadoInicial

    // ─── Habits ───────────────────────────────────────────────────────────
    case 'ADD_HABITO':
      return { ...state, habitos: [...state.habitos, action.payload] }

    case 'EDIT_HABITO':
      return {
        ...state,
        habitos: state.habitos.map(h => h.id === action.payload.id ? action.payload : h),
      }

    case 'DELETE_HABITO':
      return {
        ...state,
        habitos: state.habitos.filter(h => h.id !== action.payload),
        registrosHabito: state.registrosHabito.filter(r => r.habitoId !== action.payload),
      }

    case 'TOGGLE_REGISTRO_HABITO': {
      const { fecha, habitoId } = action.payload
      const existe = state.registrosHabito.some(
        r => r.fecha === fecha && r.habitoId === habitoId
      )
      const nuevoXP = !existe
        ? agregarXP(state.xp, crearEventoXP('habito', fecha))
        : state.xp
      const nuevosCreditos = !existe
        ? addCredito(state.creditos, { fecha, cantidad: CREDITOS.habito, motivo: 'Hábito completado' })
        : state.creditos
      return {
        ...state,
        registrosHabito: existe
          ? state.registrosHabito.filter(r => !(r.fecha === fecha && r.habitoId === habitoId))
          : [...state.registrosHabito, { fecha, habitoId }],
        xp: nuevoXP,
        creditos: nuevosCreditos,
      }
    }

    case 'SET_ESTADO_DIA': {
      const existe = state.estadosDia.some(e => e.fecha === action.payload.fecha)
      return {
        ...state,
        estadosDia: existe
          ? state.estadosDia.map(e => e.fecha === action.payload.fecha ? action.payload : e)
          : [...state.estadosDia, action.payload],
      }
    }

    // ─── Tasks ────────────────────────────────────────────────────────────
    case 'ADD_TAREA':
      return { ...state, tareas: [...state.tareas, action.payload] }

    case 'EDIT_TAREA': {
      const anterior = state.tareas.find(t => t.id === action.payload.id)
      const completandose =
        anterior?.estado !== 'Completada' && action.payload.estado === 'Completada'
      const xpClave = XP_POR_PRIORIDAD[action.payload.prioridad]
      const nuevoXP = completandose
        ? agregarXP(state.xp, crearEventoXP(xpClave, hoy()))
        : state.xp
      const creditosTarea = completandose
        ? addCredito(state.creditos, {
            fecha: hoy(),
            cantidad: CREDITOS.tarea[action.payload.prioridad],
            motivo: `Tarea completada: ${action.payload.titulo.slice(0, 30)}`,
          })
        : state.creditos
      return {
        ...state,
        tareas: state.tareas.map(t => t.id === action.payload.id ? action.payload : t),
        xp: nuevoXP,
        creditos: creditosTarea,
      }
    }

    case 'DELETE_TAREA':
      return { ...state, tareas: state.tareas.filter(t => t.id !== action.payload) }

    // ─── Weekly ───────────────────────────────────────────────────────────
    case 'UPDATE_DIA_SEMANAL': {
      const diaAnterior = state.registrosSemanal
        .find(r => r.semana === action.payload.semana)
        ?.dias?.[action.payload.fecha]
      const tieneContenidoNuevo =
        action.payload.dia.notas || action.payload.dia.mejoras || action.payload.dia.gratitud
      const yaTeníaContenido =
        diaAnterior?.notas || diaAnterior?.mejoras || diaAnterior?.gratitud
      const nuevoXP =
        tieneContenidoNuevo && !yaTeníaContenido
          ? agregarXP(state.xp, crearEventoXP('diario_semanal', hoy()))
          : state.xp
      const nuevosCreditos =
        tieneContenidoNuevo && !yaTeníaContenido
          ? addCredito(state.creditos, { fecha: hoy(), cantidad: CREDITOS.diario, motivo: 'Diario semanal' })
          : state.creditos
      return {
        ...state,
        registrosSemanal: upsertDiaSemanal(
          state.registrosSemanal,
          action.payload.semana,
          action.payload.fecha,
          action.payload.dia
        ),
        xp: nuevoXP,
        creditos: nuevosCreditos,
      }
    }

    // ─── Debts ────────────────────────────────────────────────────────────
    case 'ADD_DEUDA':
      return { ...state, deudas: [...state.deudas, action.payload] }

    case 'EDIT_DEUDA':
      return {
        ...state,
        deudas: state.deudas.map(d => d.id === action.payload.id ? action.payload : d),
      }

    case 'DELETE_DEUDA':
      return { ...state, deudas: state.deudas.filter(d => d.id !== action.payload) }

    // ─── Fixed costs ──────────────────────────────────────────────────────
    case 'ADD_COSTO_FIJO':
      return { ...state, costosFijos: [...state.costosFijos, action.payload] }

    case 'EDIT_COSTO_FIJO':
      return {
        ...state,
        costosFijos: state.costosFijos.map(c => c.id === action.payload.id ? action.payload : c),
      }

    case 'DELETE_COSTO_FIJO':
      return { ...state, costosFijos: state.costosFijos.filter(c => c.id !== action.payload) }

    // ─── Investments ──────────────────────────────────────────────────────
    case 'ADD_INVERSION':
      return { ...state, inversiones: [...state.inversiones, action.payload] }

    case 'EDIT_INVERSION':
      return {
        ...state,
        inversiones: state.inversiones.map(i => i.id === action.payload.id ? action.payload : i),
      }

    case 'DELETE_INVERSION':
      return { ...state, inversiones: state.inversiones.filter(i => i.id !== action.payload) }

    // ─── Savings funds ────────────────────────────────────────────────────
    case 'ADD_FONDO':
      return { ...state, fondos: [...state.fondos, action.payload] }

    case 'EDIT_FONDO':
      return {
        ...state,
        fondos: state.fondos.map(f => f.id === action.payload.id ? action.payload : f),
      }

    case 'DELETE_FONDO':
      return { ...state, fondos: state.fondos.filter(f => f.id !== action.payload) }

    // ─── Financial assets ─────────────────────────────────────────────────
    case 'ADD_ACTIVO':
      return { ...state, activos: [...state.activos, action.payload] }

    case 'EDIT_ACTIVO':
      return {
        ...state,
        activos: state.activos.map(a => a.id === action.payload.id ? action.payload : a),
      }

    case 'DELETE_ACTIVO':
      return { ...state, activos: state.activos.filter(a => a.id !== action.payload) }

    // ─── Business spaces ──────────────────────────────────────────────────
    case 'ADD_NEGOCIO':
      return { ...state, negocios: [...state.negocios, action.payload] }

    case 'EDIT_NEGOCIO':
      return {
        ...state,
        negocios: state.negocios.map(n => n.id === action.payload.id ? action.payload : n),
      }

    case 'DELETE_NEGOCIO':
      return {
        ...state,
        negocios: state.negocios.filter(n => n.id !== action.payload),
        transaccionesNegocio: state.transaccionesNegocio.filter(t => t.negocioId !== action.payload),
      }

    case 'ADD_TX_NEGOCIO':
      return { ...state, transaccionesNegocio: [...state.transaccionesNegocio, action.payload] }

    case 'DELETE_TX_NEGOCIO':
      return {
        ...state,
        transaccionesNegocio: state.transaccionesNegocio.filter(t => t.id !== action.payload),
      }

    // ─── Dashboards ───────────────────────────────────────────────────────
    case 'ADD_DASHBOARD':
      return { ...state, dashboards: [...state.dashboards, action.payload] }
    case 'EDIT_DASHBOARD':
      return { ...state, dashboards: state.dashboards.map(d => d.id === action.payload.id ? action.payload : d) }
    case 'DELETE_DASHBOARD':
      return { ...state, dashboards: state.dashboards.filter(d => d.id !== action.payload) }

    // ─── Gamification ─────────────────────────────────────────────────────
    case 'COMPLETAR_ONBOARDING': {
      const bienvenida: EventoXP = crearEventoXP('onboarding', hoy())
      return {
        ...state,
        perfil: action.payload,
        xp: agregarXP(state.xp, bienvenida),
        creditos: addCredito(state.creditos, { fecha: hoy(), cantidad: CREDITOS.onboarding, motivo: 'Bienvenido a CIMA 🚀' }),
      }
    }

    case 'ADD_XP':
      return { ...state, xp: agregarXP(state.xp, action.payload) }

    default:
      return state
  }
}

function reducer(state: AppState, action: AppAction): AppState {
  const next = reducerCore(state, action)
  // Skip logro check for bulk loads (already has logros set) and pure reads
  if (action.type === 'CARGAR_DEMO') return next
  return applyLogros(next)
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, cargarEstado)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
