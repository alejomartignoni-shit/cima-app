import { subDays, subMonths, format, startOfMonth, startOfWeek, subWeeks, addDays } from 'date-fns'
import type {
  Transaccion, DiaActivo, Deuda, EventoXP, Presupuesto,
  Habito, RegistroHabito, EstadoDia, Tarea, RegistroSemanal, PerfilUsuario, Dashboard,
} from '../types'

function fechaDias(diasAtras: number): string {
  return format(subDays(new Date(), diasAtras), 'yyyy-MM-dd')
}

function fechaMes(mesesAtras: number, diaDelMes: number): string {
  const base = startOfMonth(subMonths(new Date(), mesesAtras))
  const d = new Date(base.getFullYear(), base.getMonth(), diaDelMes)
  return format(d, 'yyyy-MM-dd')
}

// Monday of N weeks ago
function lunesSemana(semanasAtras: number): string {
  return format(startOfWeek(subWeeks(new Date(), semanasAtras), { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

// Day of week within that week (offset 0=Mon, 1=Tue, … 4=Fri)
function diaSemana(semanasAtras: number, diasOffset: number): string {
  const lunes = startOfWeek(subWeeks(new Date(), semanasAtras), { weekStartsOn: 1 })
  return format(addDays(lunes, diasOffset), 'yyyy-MM-dd')
}

function id(): string {
  return `demo-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Transactions ─────────────────────────────────────────────────────────────

const txMesActual: Transaccion[] = [
  { id: id(), fecha: fechaDias(29), tipo: 'ingreso', categoria: 'Salario', monto: 2_300_000, nota: 'Sueldo mes actual' },
  { id: id(), fecha: fechaDias(20), tipo: 'ingreso', categoria: 'Freelance / Proyectos', monto: 480_000, nota: 'Proyecto landing page' },
  { id: id(), fecha: fechaDias(7), tipo: 'ingreso', categoria: 'Freelance / Proyectos', monto: 310_000, nota: 'Consultoría 4 sesiones' },
  { id: id(), fecha: fechaDias(3), tipo: 'ingreso', categoria: 'Ventas', monto: 95_000, nota: 'Venta notebook usada' },
  { id: id(), fecha: fechaDias(12), tipo: 'ingreso', categoria: 'Inversiones', monto: 72_000, nota: 'Renta FCI pesos' },
  { id: id(), fecha: fechaDias(1), tipo: 'ingreso', categoria: 'Otros ingresos', monto: 45_000, nota: 'Staking cripto' },
  { id: id(), fecha: fechaDias(28), tipo: 'gasto', categoria: 'Vivienda y alquiler', monto: 870_000, nota: 'Alquiler' },
  { id: id(), fecha: fechaDias(25), tipo: 'gasto', categoria: 'Servicios', monto: 19_500, nota: 'Luz' },
  { id: id(), fecha: fechaDias(24), tipo: 'gasto', categoria: 'Servicios', monto: 13_200, nota: 'Gas' },
  { id: id(), fecha: fechaDias(23), tipo: 'gasto', categoria: 'Servicios', monto: 9_800, nota: 'Internet' },
  { id: id(), fecha: fechaDias(22), tipo: 'gasto', categoria: 'Servicios', monto: 7_200, nota: 'Spotify + Netflix' },
  { id: id(), fecha: fechaDias(27), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 92_000, nota: 'Super semanal' },
  { id: id(), fecha: fechaDias(21), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 88_000, nota: 'Carrefour + verdulería' },
  { id: id(), fecha: fechaDias(14), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 79_500, nota: 'Compra semanal' },
  { id: id(), fecha: fechaDias(8), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 68_000, nota: 'Super + fiambrería' },
  { id: id(), fecha: fechaDias(5), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 45_000, nota: 'Restaurante' },
  { id: id(), fecha: fechaDias(2), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 91_000, nota: 'Compra semanal' },
  { id: id(), fecha: fechaDias(26), tipo: 'gasto', categoria: 'Transporte', monto: 16_000, nota: 'SUBE mensual' },
  { id: id(), fecha: fechaDias(18), tipo: 'gasto', categoria: 'Transporte', monto: 35_000, nota: 'Nafta' },
  { id: id(), fecha: fechaDias(9), tipo: 'gasto', categoria: 'Transporte', monto: 9_500, nota: 'Uber' },
  { id: id(), fecha: fechaDias(19), tipo: 'gasto', categoria: 'Salud', monto: 72_000, nota: 'Prepaga Osde 210' },
  { id: id(), fecha: fechaDias(11), tipo: 'gasto', categoria: 'Salud', monto: 26_000, nota: 'Médico + análisis' },
  { id: id(), fecha: fechaDias(16), tipo: 'gasto', categoria: 'Educación', monto: 58_000, nota: 'Curso React avanzado' },
  { id: id(), fecha: fechaDias(13), tipo: 'gasto', categoria: 'Entretenimiento y ocio', monto: 30_000, nota: 'Cine + palomitas' },
  { id: id(), fecha: fechaDias(6), tipo: 'gasto', categoria: 'Entretenimiento y ocio', monto: 17_000, nota: 'Juego Steam' },
  { id: id(), fecha: fechaDias(17), tipo: 'gasto', categoria: 'Ropa y accesorios', monto: 82_000, nota: 'Zapatillas Nike' },
  { id: id(), fecha: fechaDias(4), tipo: 'gasto', categoria: 'Otros', monto: 22_000, nota: 'Regalo' },
]

function generarMes(mesesAtras: number, escalaIngreso: number = 1): Transaccion[] {
  return [
    { id: id(), fecha: fechaMes(mesesAtras, 5), tipo: 'ingreso', categoria: 'Salario', monto: Math.round(2_100_000 * escalaIngreso), nota: 'Sueldo' },
    { id: id(), fecha: fechaMes(mesesAtras, 18), tipo: 'ingreso', categoria: 'Freelance / Proyectos', monto: Math.round(380_000 * escalaIngreso), nota: 'Freelance' },
    { id: id(), fecha: fechaMes(mesesAtras, 25), tipo: 'ingreso', categoria: 'Inversiones', monto: Math.round(55_000 * escalaIngreso), nota: 'Inversión' },
    { id: id(), fecha: fechaMes(mesesAtras, 3), tipo: 'gasto', categoria: 'Vivienda y alquiler', monto: Math.round(820_000 * escalaIngreso), nota: 'Alquiler' },
    { id: id(), fecha: fechaMes(mesesAtras, 6), tipo: 'gasto', categoria: 'Servicios', monto: 42_000, nota: 'Servicios del mes' },
    { id: id(), fecha: fechaMes(mesesAtras, 8), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 350_000, nota: 'Alimentación mensual' },
    { id: id(), fecha: fechaMes(mesesAtras, 10), tipo: 'gasto', categoria: 'Transporte', monto: 60_000, nota: 'Transporte' },
    { id: id(), fecha: fechaMes(mesesAtras, 12), tipo: 'gasto', categoria: 'Salud', monto: 72_000, nota: 'Prepaga' },
    { id: id(), fecha: fechaMes(mesesAtras, 20), tipo: 'gasto', categoria: 'Educación', monto: 50_000, nota: 'Cursos' },
    { id: id(), fecha: fechaMes(mesesAtras, 22), tipo: 'gasto', categoria: 'Entretenimiento y ocio', monto: 45_000, nota: 'Ocio' },
  ]
}

const txHistorico: Transaccion[] = [
  ...generarMes(1, 0.92),
  ...generarMes(2, 0.88),
  ...generarMes(3, 0.95),
  ...generarMes(4, 0.85),
  ...generarMes(5, 0.90),
  ...generarMes(6, 0.82),
  ...generarMes(7, 0.78),
  ...generarMes(8, 0.80),
  ...generarMes(9, 0.75),
  ...generarMes(10, 0.72),
  ...generarMes(11, 0.70),
]

export const transaccionesDemo: Transaccion[] = [...txMesActual, ...txHistorico]

// ─── Días activos — 91-day consecutive streak ────────────────────────────────

export function generarDiasActivosDemo(): DiaActivo[] {
  const dias: DiaActivo[] = []
  for (let i = 0; i <= 90; i++) {
    dias.push({ fecha: fechaDias(i), porTransaccion: false, porCheckIn: true })
  }
  return dias
}

// ─── Presupuestos ─────────────────────────────────────────────────────────────

const mesHoy = format(new Date(), 'yyyy-MM')
const mesPrevStr = format(subMonths(new Date(), 1), 'yyyy-MM')

export const presupuestosDemo: Presupuesto[] = [
  { id: 'pres-1',  categoria: 'Alimentos y bebidas',   monto: 450_000, mes: mesHoy },
  { id: 'pres-2',  categoria: 'Transporte',             monto: 80_000,  mes: mesHoy },
  { id: 'pres-3',  categoria: 'Salud',                  monto: 110_000, mes: mesHoy },
  { id: 'pres-4',  categoria: 'Entretenimiento y ocio', monto: 70_000,  mes: mesHoy },
  { id: 'pres-5',  categoria: 'Educación',              monto: 80_000,  mes: mesHoy },
  { id: 'pres-6',  categoria: 'Servicios',              monto: 60_000,  mes: mesHoy },
  { id: 'pres-7',  categoria: 'Alimentos y bebidas',   monto: 420_000, mes: mesPrevStr },
  { id: 'pres-8',  categoria: 'Transporte',             monto: 75_000,  mes: mesPrevStr },
  { id: 'pres-9',  categoria: 'Salud',                  monto: 100_000, mes: mesPrevStr },
  { id: 'pres-10', categoria: 'Entretenimiento y ocio', monto: 65_000,  mes: mesPrevStr },
  { id: 'pres-11', categoria: 'Educación',              monto: 70_000,  mes: mesPrevStr },
  { id: 'pres-12', categoria: 'Servicios',              monto: 55_000,  mes: mesPrevStr },
]

// ─── Debts ────────────────────────────────────────────────────────────────────

export const deudasDemo: Deuda[] = [
  {
    id: 'deuda-demo-1',
    nombre: 'Tarjeta Visa',
    tipo: 'Tarjeta de crédito',
    montoTotal: 450_000,
    montoRestante: 280_000,
    tasaInteres: 72,
    cuotaMensual: 95_000,
  },
  {
    id: 'deuda-demo-2',
    nombre: 'Préstamo personal banco',
    tipo: 'Préstamo',
    montoTotal: 1_200_000,
    montoRestante: 850_000,
    tasaInteres: 48,
    fechaVencimiento: fechaMes(-18, 1),
    cuotaMensual: 72_000,
  },
  {
    id: 'deuda-demo-3',
    nombre: 'Cuotas notebook',
    tipo: 'Otro',
    montoTotal: 320_000,
    montoRestante: 160_000,
    cuotaMensual: 32_000,
  },
]

// ─── Habits ───────────────────────────────────────────────────────────────────

export const habitosDemo: Habito[] = [
  { id: 'h1', nombre: 'Ejercicio', emoji: '💪', color: '#10b981', activo: true, creadoEn: fechaDias(90) },
  { id: 'h2', nombre: 'Lectura', emoji: '📖', color: '#3b82f6', activo: true, creadoEn: fechaDias(90) },
  { id: 'h3', nombre: 'Meditación', emoji: '🧘', color: '#8b5cf6', activo: true, creadoEn: fechaDias(90) },
  { id: 'h4', nombre: 'Ahorro diario', emoji: '💰', color: '#f59e0b', activo: true, creadoEn: fechaDias(90) },
  { id: 'h5', nombre: 'Sin alcohol', emoji: '🎯', color: '#f43f5e', activo: true, creadoEn: fechaDias(60) },
  { id: 'h6', nombre: 'Hidratación 2L', emoji: '💧', color: '#06b6d4', activo: true, creadoEn: fechaDias(60) },
]

const HABITO_IDS = habitosDemo.map(h => h.id)

// Current month: every elapsed day (from day 1 to today)
const diaHoy = new Date().getDate()
const registrosMesActual: RegistroHabito[] = HABITO_IDS.flatMap(hid =>
  Array.from({ length: diaHoy }, (_, i) => ({
    fecha: fechaMes(0, i + 1),
    habitoId: hid,
  }))
)

// Previous month (30 days): skip days 5, 11, 18, 24 → 26/30 ≈ 87%
const diasPrevMesOk = Array.from({ length: 30 }, (_, i) => i + 1)
  .filter(d => ![5, 11, 18, 24].includes(d))
const registrosMesAnterior: RegistroHabito[] = HABITO_IDS.flatMap(hid =>
  diasPrevMesOk.map(d => ({ fecha: fechaMes(1, d), habitoId: hid }))
)

export const registrosHabitoDemo: RegistroHabito[] = [
  ...registrosMesActual,
  ...registrosMesAnterior,
]

// ─── Estado del día (mood) ────────────────────────────────────────────────────

export const estadosDiaDemo: EstadoDia[] = [
  { fecha: fechaDias(0), estado: 5, motivacion: 5 },
  { fecha: fechaDias(1), estado: 5, motivacion: 4 },
  { fecha: fechaDias(2), estado: 4, motivacion: 5 },
  { fecha: fechaDias(3), estado: 5, motivacion: 5 },
  { fecha: fechaDias(4), estado: 3, motivacion: 4 },
  { fecha: fechaDias(5), estado: 4, motivacion: 4 },
  { fecha: fechaDias(6), estado: 5, motivacion: 5 },
  { fecha: fechaDias(7), estado: 5, motivacion: 5 },
  { fecha: fechaDias(8), estado: 4, motivacion: 3 },
  { fecha: fechaDias(9), estado: 5, motivacion: 5 },
]

// ─── Tareas ───────────────────────────────────────────────────────────────────

export const tareasDemo: Tarea[] = [
  {
    id: 'tarea-demo-1',
    titulo: 'Cerrar propuesta con cliente Martín',
    descripcion: 'Enviar contrato y confirmar inicio el 15/07',
    prioridad: 'Alta',
    estado: 'Completada',
    categoria: 'Trabajo',
    creadaEn: fechaDias(14),
    fechaVencimiento: fechaDias(7),
  },
  {
    id: 'tarea-demo-2',
    titulo: 'Revisar facturación del mes',
    descripcion: 'Verificar facturas y reconciliar con el banco',
    prioridad: 'Alta',
    estado: 'Completada',
    categoria: 'Finanzas',
    creadaEn: fechaDias(10),
  },
  {
    id: 'tarea-demo-3',
    titulo: 'Renovar prepaga Osde 210',
    prioridad: 'Alta',
    estado: 'Completada',
    categoria: 'Salud',
    creadaEn: fechaDias(20),
  },
  {
    id: 'tarea-demo-4',
    titulo: 'Hacer presupuesto trimestral Q3',
    descripcion: 'Proyección julio–septiembre 2026',
    prioridad: 'Alta',
    estado: 'Completada',
    categoria: 'Finanzas',
    creadaEn: fechaDias(4),
  },
  {
    id: 'tarea-demo-5',
    titulo: 'Construir landing page nuevo cliente',
    descripcion: 'React + Tailwind. Entrega acordada en 10 días',
    prioridad: 'Alta',
    estado: 'En progreso',
    categoria: 'Trabajo',
    creadaEn: fechaDias(5),
    fechaVencimiento: fechaDias(-10),
  },
  {
    id: 'tarea-demo-6',
    titulo: 'Estudiar inversiones FCI vs acciones',
    descripcion: 'Comparar Mercado Pago, IOL y Balanz',
    prioridad: 'Media',
    estado: 'En progreso',
    categoria: 'Finanzas',
    creadaEn: fechaDias(8),
  },
  {
    id: 'tarea-demo-7',
    titulo: 'Organizar home office',
    prioridad: 'Media',
    estado: 'En progreso',
    categoria: 'Hogar',
    creadaEn: fechaDias(3),
  },
  {
    id: 'tarea-demo-8',
    titulo: 'Planificar viaje a Bariloche',
    descripcion: 'Agosto 2026, presupuesto máx $500k',
    prioridad: 'Media',
    estado: 'Sin empezar',
    categoria: 'Personal',
    creadaEn: fechaDias(2),
    fechaVencimiento: fechaDias(-30),
  },
  {
    id: 'tarea-demo-9',
    titulo: 'Actualizar perfil LinkedIn',
    prioridad: 'Baja',
    estado: 'Sin empezar',
    categoria: 'Trabajo',
    creadaEn: fechaDias(6),
  },
  {
    id: 'tarea-demo-10',
    titulo: 'Leer "Padre Rico, Padre Pobre"',
    prioridad: 'Baja',
    estado: 'Sin empezar',
    categoria: 'Educación',
    creadaEn: fechaDias(1),
  },
  {
    id: 'tarea-demo-11',
    titulo: 'Sacar turno traumatólogo',
    prioridad: 'Media',
    estado: 'Sin empezar',
    categoria: 'Salud',
    creadaEn: fechaDias(5),
    fechaVencimiento: fechaDias(-14),
  },
  {
    id: 'tarea-demo-12',
    titulo: 'Aprender Go desde cero',
    descripcion: 'Postergado, prioridad baja por ahora',
    prioridad: 'Opcional',
    estado: 'Cancelada',
    categoria: 'Educación',
    creadaEn: fechaDias(30),
  },
]

// ─── Weekly planner ───────────────────────────────────────────────────────────

export const registrosSemanalesDemo: RegistroSemanal[] = [
  {
    semana: lunesSemana(0),
    dias: {
      [diaSemana(0, 0)]: { notas: 'Reunión con cliente Martín — cerré la propuesta', mejoras: 'Llegué 10 min tarde', gratitud: 'Buena energía desde temprano' },
      [diaSemana(0, 1)]: { notas: 'Trabajé 3h en el módulo de pagos, avancé bastante', mejoras: 'Podría haber tomado más agua', gratitud: 'Terminé antes de lo planeado' },
      [diaSemana(0, 2)]: { notas: 'Estudié React patterns avanzados + gym', mejoras: 'Salir más temprano a correr', gratitud: 'Aprendí algo nuevo sobre hooks' },
      [diaSemana(0, 3)]: { notas: 'Llamada con inversores, resultados positivos', mejoras: 'Organizar mejor el inbox', gratitud: 'El sol estuvo increíble hoy' },
      [diaSemana(0, 4)]: { notas: 'Review semanal + planificación Q3 completa', mejoras: 'Sacar más tiempo para leer', gratitud: 'Semana muy productiva, orgulloso' },
    },
  },
  {
    semana: lunesSemana(1),
    dias: {
      [diaSemana(1, 0)]: { notas: 'Inicio de semana fuerte, gym mañana', mejoras: 'Dormir antes de las 23h', gratitud: 'Café con Sofía muy productivo' },
      [diaSemana(1, 1)]: { notas: 'Entregué el diseño del dashboard al cliente', mejoras: 'Menos redes sociales por la tarde', gratitud: 'El cliente quedó súper conforme' },
      [diaSemana(1, 2)]: { notas: 'Sesión de meditación larga + revisé finanzas', mejoras: 'Prepararme más para reuniones', gratitud: 'Saldo positivo este mes 🙌' },
      [diaSemana(1, 3)]: { notas: 'Networking en evento tech Córdoba', mejoras: 'Llevar tarjetas la próxima', gratitud: 'Conocí gente muy interesante' },
      [diaSemana(1, 4)]: { notas: 'Día de cierre y descanso activo', mejoras: 'Planificar el fin de semana con anticipación', gratitud: 'Me siento muy bien físicamente' },
    },
  },
  {
    semana: lunesSemana(2),
    dias: {
      [diaSemana(2, 0)]: { notas: 'Reunión kickoff proyecto nuevo', mejoras: 'Definir mejor el scope desde el inicio', gratitud: 'Equipo muy comprometido' },
      [diaSemana(2, 1)]: { notas: 'Revisé inversiones y moví $150k a FCI', mejoras: 'Investigar más sobre acciones locales', gratitud: 'Rendimiento del mes fue bueno' },
      [diaSemana(2, 2)]: { notas: 'Gym + lectura 45min + trabajo freelance', mejoras: 'Dividir mejor los bloques de tiempo', gratitud: 'Rutina funcionando perfecta' },
      [diaSemana(2, 4)]: { notas: 'Cierre de semana, metas cumplidas al 80%', mejoras: 'Ser más consistente con la meditación', gratitud: 'Avancé mucho en el proyecto' },
    },
  },
]

// ─── Perfil ───────────────────────────────────────────────────────────────────

export const perfilDemo: PerfilUsuario = {
  nombre: 'Demo CIMA',
  objetivo: 'libertad',
  obstaculo: '',
  intereses: ['Inversiones', 'Tecnología', 'Fitness'],
  onboardingCompletado: true,
  creadoEn: fechaDias(365),
}

// ─── Dashboards ───────────────────────────────────────────────────────────────

const hoyStr = format(new Date(), 'yyyy-MM-dd')

export const dashboardsDemo: Dashboard[] = [
  {
    id: 'db-demo-1',
    nombre: 'Finanzas',
    creadoEn: hoyStr,
    widgets: [
      { id: 'w-d1-1', type: 'kpi_balance' },
      { id: 'w-d1-2', type: 'kpi_ingresos' },
      { id: 'w-d1-3', type: 'kpi_gastos' },
      { id: 'w-d1-4', type: 'kpi_ahorro' },
      { id: 'w-d1-5', type: 'chart_bar_6meses' },
      { id: 'w-d1-6', type: 'chart_pie_gastos' },
      { id: 'w-d1-7', type: 'recent_tx' },
      { id: 'w-d1-8', type: 'kpi_deuda' },
    ],
  },
  {
    id: 'db-demo-2',
    nombre: 'Productividad',
    creadoEn: hoyStr,
    widgets: [
      { id: 'w-d2-1', type: 'kpi_racha' },
      { id: 'w-d2-2', type: 'kpi_xp' },
      { id: 'w-d2-3', type: 'kpi_tareas' },
      { id: 'w-d2-4', type: 'task_progress' },
      { id: 'w-d2-5', type: 'chart_habits' },
    ],
  },
  {
    id: 'db-demo-3',
    nombre: 'Resumen',
    creadoEn: hoyStr,
    widgets: [
      { id: 'w-d3-1', type: 'kpi_balance' },
      { id: 'w-d3-2', type: 'kpi_racha' },
      { id: 'w-d3-3', type: 'kpi_xp' },
      { id: 'w-d3-4', type: 'camino_millon' },
      { id: 'w-d3-5', type: 'chart_area_ahorro' },
    ],
  },
]

// ─── XP Events — totaling 20,956 XP (Élite rank) ─────────────────────────────
// 365 check-ins × 5        = 1,825
// 365 transactions × 5     = 1,825
// 6 habits × 270 days × 10 = 16,200
// 20 alta tasks × 25       =   500
// 20 media tasks × 15      =   300
// 10 baja tasks × 10       =   100
// 52 journals × 3          =   156
// 1 onboarding × 50        =    50
// Total                    = 20,956 XP

export const xpEventosDemo: EventoXP[] = [
  { fecha: fechaDias(365), cantidad: 50, motivo: 'Bienvenido a CIMA 🎉' },
  ...Array.from({ length: 365 }, (_, i) => ({
    fecha: fechaDias(364 - i),
    cantidad: 5,
    motivo: 'Check-in diario',
  })),
  ...Array.from({ length: 365 }, (_, i) => ({
    fecha: fechaDias(364 - i),
    cantidad: 5,
    motivo: 'Transacción registrada',
  })),
  ...HABITO_IDS.flatMap(() =>
    Array.from({ length: 270 }, (_, i) => ({
      fecha: fechaDias(269 - i),
      cantidad: 10,
      motivo: 'Hábito completado',
    }))
  ),
  ...Array.from({ length: 20 }, (_, i) => ({
    fecha: fechaDias(200 - i * 10),
    cantidad: 25,
    motivo: 'Tarea Alta completada',
  })),
  ...Array.from({ length: 20 }, (_, i) => ({
    fecha: fechaDias(180 - i * 9),
    cantidad: 15,
    motivo: 'Tarea Media completada',
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    fecha: fechaDias(80 - i * 8),
    cantidad: 10,
    motivo: 'Tarea Baja completada',
  })),
  ...Array.from({ length: 52 }, (_, i) => ({
    fecha: fechaDias(364 - i * 7),
    cantidad: 3,
    motivo: 'Diario semanal',
  })),
]
