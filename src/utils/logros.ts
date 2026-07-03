import { format, subDays } from 'date-fns'
import type { AppState, Logro, EstadoCreditos, CreditoEvento } from '../types'
import { calcularRacha } from './streakLogic'

export type CategoriaLogro = 'racha' | 'finanzas' | 'habitos' | 'tareas' | 'rango' | 'especial'

export interface LogroDefinicion {
  id: string
  nombre: string
  descripcion: string
  icono: string
  creditos: number
  categoria: CategoriaLogro
  condicion: (state: AppState) => boolean
}

export const LOGROS_DEF: LogroDefinicion[] = [
  // ─── RACHA ───────────────────────────────────────────────────────────────────
  { id: 'racha-3', nombre: '3 días encendido', descripcion: 'Mantuviste la racha 3 días seguidos',
    icono: '🔥', creditos: 30, categoria: 'racha',
    condicion: s => calcularRacha(s.diasActivos, s.transacciones) >= 3 },
  { id: 'racha-7', nombre: 'Semana perfecta', descripcion: '7 días de racha sin parar',
    icono: '🔥', creditos: 75, categoria: 'racha',
    condicion: s => calcularRacha(s.diasActivos, s.transacciones) >= 7 },
  { id: 'racha-14', nombre: 'Dos semanas imparable', descripcion: '14 días de racha activa',
    icono: '⚡', creditos: 150, categoria: 'racha',
    condicion: s => calcularRacha(s.diasActivos, s.transacciones) >= 14 },
  { id: 'racha-30', nombre: 'Mes de fuego', descripcion: '30 días de racha — no es suerte, es sistema',
    icono: '🌋', creditos: 300, categoria: 'racha',
    condicion: s => calcularRacha(s.diasActivos, s.transacciones) >= 30 },
  { id: 'racha-90', nombre: 'Imparable', descripcion: '90 días de racha. Sos una máquina.',
    icono: '💥', creditos: 900, categoria: 'racha',
    condicion: s => calcularRacha(s.diasActivos, s.transacciones) >= 90 },
  { id: 'racha-365', nombre: 'Un año sin parar', descripcion: '365 días de racha. Legendario.',
    icono: '🏆', creditos: 5000, categoria: 'racha',
    condicion: s => calcularRacha(s.diasActivos, s.transacciones) >= 365 },

  // ─── FINANZAS ─────────────────────────────────────────────────────────────────
  { id: 'tx-primera', nombre: 'Primera transacción', descripcion: 'Registraste tu primer movimiento de dinero',
    icono: '💸', creditos: 25, categoria: 'finanzas',
    condicion: s => s.transacciones.length >= 1 },
  { id: 'tx-10', nombre: 'Contador activo', descripcion: '10 transacciones registradas',
    icono: '📊', creditos: 50, categoria: 'finanzas',
    condicion: s => s.transacciones.length >= 10 },
  { id: 'tx-50', nombre: 'Maestro del registro', descripcion: '50 transacciones registradas',
    icono: '📈', creditos: 150, categoria: 'finanzas',
    condicion: s => s.transacciones.length >= 50 },
  { id: 'tx-200', nombre: 'Obsesión financiera', descripcion: '200 transacciones. Nada se te escapa.',
    icono: '🔭', creditos: 500, categoria: 'finanzas',
    condicion: s => s.transacciones.length >= 200 },
  { id: 'mes-positivo', nombre: 'En verde', descripcion: 'Cerraste un mes con saldo positivo',
    icono: '🟢', creditos: 100, categoria: 'finanzas',
    condicion: s => {
      const mes = format(new Date(), 'yyyy-MM')
      const txs = s.transacciones.filter(t => t.fecha.startsWith(mes))
      const ing = txs.filter(t => t.tipo === 'ingreso').reduce((a, t) => a + t.monto, 0)
      const gas = txs.filter(t => t.tipo === 'gasto').reduce((a, t) => a + t.monto, 0)
      return ing > 0 && ing > gas
    } },
  { id: 'ahorro-20', nombre: 'Ahorrador pro', descripcion: 'Ahorraste más del 20% en un mes',
    icono: '🏦', creditos: 250, categoria: 'finanzas',
    condicion: s => {
      const mes = format(new Date(), 'yyyy-MM')
      const txs = s.transacciones.filter(t => t.fecha.startsWith(mes))
      const ing = txs.filter(t => t.tipo === 'ingreso').reduce((a, t) => a + t.monto, 0)
      const gas = txs.filter(t => t.tipo === 'gasto').reduce((a, t) => a + t.monto, 0)
      return ing > 0 && (ing - gas) / ing >= 0.20
    } },
  { id: 'presupuesto-activo', nombre: 'Con presupuesto', descripcion: '3 categorías presupuestadas este mes',
    icono: '📋', creditos: 75, categoria: 'finanzas',
    condicion: s => {
      const mes = format(new Date(), 'yyyy-MM')
      return s.presupuestos.filter(p => p.mes === mes).length >= 3
    } },
  { id: 'deuda-registrada', nombre: 'Cara a cara con la deuda', descripcion: 'Registraste tu primera deuda. Conocer es poder.',
    icono: '💳', creditos: 50, categoria: 'finanzas',
    condicion: s => s.deudas.length >= 1 },

  // ─── HÁBITOS ──────────────────────────────────────────────────────────────────
  { id: 'habito-primero', nombre: 'Primer hábito', descripcion: 'Creaste tu primer hábito. Todo empieza aquí.',
    icono: '🌱', creditos: 50, categoria: 'habitos',
    condicion: s => s.habitos.length >= 1 },
  { id: 'habito-3-activos', nombre: 'Sistema en marcha', descripcion: '3 o más hábitos activos simultáneos',
    icono: '⚙️', creditos: 100, categoria: 'habitos',
    condicion: s => s.habitos.filter(h => h.activo).length >= 3 },
  { id: 'habito-5-activos', nombre: 'Arquitecto de hábitos', descripcion: '5 hábitos activos simultáneos',
    icono: '🏗️', creditos: 200, categoria: 'habitos',
    condicion: s => s.habitos.filter(h => h.activo).length >= 5 },
  { id: 'habito-100-registros', nombre: 'Consistencia', descripcion: '100 registros de hábitos completados',
    icono: '💪', creditos: 150, categoria: 'habitos',
    condicion: s => s.registrosHabito.length >= 100 },
  { id: 'habito-500-registros', nombre: 'Disciplina de hierro', descripcion: '500 registros de hábitos completados',
    icono: '🦾', creditos: 750, categoria: 'habitos',
    condicion: s => s.registrosHabito.length >= 500 },

  // ─── TAREAS ───────────────────────────────────────────────────────────────────
  { id: 'tarea-primera', nombre: 'Primera tarea completada', descripcion: 'Terminaste tu primera tarea. El inicio importa.',
    icono: '✅', creditos: 30, categoria: 'tareas',
    condicion: s => s.tareas.some(t => t.estado === 'Completada') },
  { id: 'tarea-10', nombre: 'Ejecutor', descripcion: '10 tareas completadas',
    icono: '⚡', creditos: 100, categoria: 'tareas',
    condicion: s => s.tareas.filter(t => t.estado === 'Completada').length >= 10 },
  { id: 'tarea-25', nombre: 'Hacedor', descripcion: '25 tareas completadas. Decís y cumplís.',
    icono: '🎯', creditos: 250, categoria: 'tareas',
    condicion: s => s.tareas.filter(t => t.estado === 'Completada').length >= 25 },
  { id: 'tarea-alta-3', nombre: 'Prioridad primero', descripcion: '3 tareas de alta prioridad completadas',
    icono: '🔴', creditos: 150, categoria: 'tareas',
    condicion: s => s.tareas.filter(t => t.estado === 'Completada' && t.prioridad === 'Alta').length >= 3 },

  // ─── RANGO ────────────────────────────────────────────────────────────────────
  { id: 'rango-aprendiz', nombre: 'Rango Aprendiz', descripcion: 'Alcanzaste el rango Aprendiz',
    icono: '📗', creditos: 50, categoria: 'rango',
    condicion: s => s.xp.total >= 100 },
  { id: 'rango-bronce', nombre: '¡Bronce desbloqueado!', descripcion: 'Alcanzaste el rango Bronce',
    icono: '🥉', creditos: 100, categoria: 'rango',
    condicion: s => s.xp.total >= 300 },
  { id: 'rango-plata', nombre: '¡Plata desbloqueado!', descripcion: 'Alcanzaste el rango Plata',
    icono: '🥈', creditos: 200, categoria: 'rango',
    condicion: s => s.xp.total >= 700 },
  { id: 'rango-oro', nombre: '¡Oro desbloqueado!', descripcion: 'Top 40% de usuarios de CIMA',
    icono: '🥇', creditos: 500, categoria: 'rango',
    condicion: s => s.xp.total >= 1500 },
  { id: 'rango-platino', nombre: '¡Platino desbloqueado!', descripcion: 'Top 20% de usuarios de CIMA',
    icono: '💎', creditos: 1000, categoria: 'rango',
    condicion: s => s.xp.total >= 3000 },
  { id: 'rango-esmeralda', nombre: '¡Esmeralda desbloqueado!', descripcion: 'Top 10% de usuarios de CIMA',
    icono: '💚', creditos: 2000, categoria: 'rango',
    condicion: s => s.xp.total >= 6000 },
  { id: 'rango-zafiro', nombre: '¡Zafiro desbloqueado!', descripcion: 'Top 5% de usuarios de CIMA',
    icono: '💙', creditos: 3000, categoria: 'rango',
    condicion: s => s.xp.total >= 10000 },
  { id: 'rango-diamante', nombre: '¡Diamante desbloqueado!', descripcion: 'Top 2% de usuarios de CIMA',
    icono: '💠', creditos: 5000, categoria: 'rango',
    condicion: s => s.xp.total >= 15000 },
  { id: 'rango-elite', nombre: '¡ÉLITE! Merch desbloqueado 👑', descripcion: 'El 1% de CIMA. Merch gratis de Mentes Millonarias.',
    icono: '👑', creditos: 10000, categoria: 'rango',
    condicion: s => s.xp.total >= 20000 },

  // ─── ESPECIAL ─────────────────────────────────────────────────────────────────
  { id: 'diario-primer', nombre: 'Primer diario', descripcion: 'Escribiste tu primer diario semanal',
    icono: '✍️', creditos: 30, categoria: 'especial',
    condicion: s => s.registrosSemanal.some(r => Object.keys(r.dias).length > 0) },
  { id: 'diario-10', nombre: 'Escritor consistente', descripcion: '10 semanas con diario registrado',
    icono: '📓', creditos: 150, categoria: 'especial',
    condicion: s => s.registrosSemanal.filter(r => Object.keys(r.dias).length > 0).length >= 10 },
  { id: 'mood-racha', nombre: 'En sintonía', descripcion: 'Registraste tu estado de ánimo 7 días seguidos',
    icono: '🎭', creditos: 100, categoria: 'especial',
    condicion: s => {
      for (let i = 0; i < 7; i++) {
        const f = format(subDays(new Date(), i), 'yyyy-MM-dd')
        if (!s.estadosDia.some(e => e.fecha === f)) return false
      }
      return true
    } },
]

export function getCreditosLogro(logroId: string): number {
  return LOGROS_DEF.find(l => l.id === logroId)?.creditos ?? 0
}

function pushCredito(creditos: EstadoCreditos, evento: CreditoEvento): EstadoCreditos {
  return {
    total: creditos.total + evento.cantidad,
    historial: [...creditos.historial.slice(-99), evento],
  }
}

export function applyLogros(nextState: AppState): AppState {
  const desbloqueados = new Set(nextState.logros.map(l => l.id))
  const fecha = format(new Date(), 'yyyy-MM-dd')
  const nuevos: Logro[] = []
  let creditos = nextState.creditos

  for (const def of LOGROS_DEF) {
    if (!desbloqueados.has(def.id) && def.condicion(nextState)) {
      nuevos.push({ id: def.id, nombre: def.nombre, descripcion: def.descripcion, icono: def.icono, desbloqueadoEn: fecha })
      if (def.creditos > 0) {
        creditos = pushCredito(creditos, { fecha, cantidad: def.creditos, motivo: `🏆 ${def.nombre}` })
      }
    }
  }

  if (nuevos.length === 0) return nextState
  return { ...nextState, logros: [...nextState.logros, ...nuevos], creditos }
}
