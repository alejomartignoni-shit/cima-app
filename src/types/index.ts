export type TipoTransaccion = 'ingreso' | 'gasto'

export type CategoriaGasto =
  | 'Alimentos y bebidas'
  | 'Transporte'
  | 'Vivienda y alquiler'
  | 'Servicios'
  | 'Salud'
  | 'Educación'
  | 'Entretenimiento y ocio'
  | 'Ropa y accesorios'
  | 'Otros'

export type CategoriaIngreso =
  | 'Salario'
  | 'Freelance / Proyectos'
  | 'Ventas'
  | 'Inversiones'
  | 'Otros ingresos'

export type Categoria = CategoriaGasto | CategoriaIngreso

export const CATEGORIAS_GASTO: CategoriaGasto[] = [
  'Alimentos y bebidas',
  'Transporte',
  'Vivienda y alquiler',
  'Servicios',
  'Salud',
  'Educación',
  'Entretenimiento y ocio',
  'Ropa y accesorios',
  'Otros',
]

export const CATEGORIAS_INGRESO: CategoriaIngreso[] = [
  'Salario',
  'Freelance / Proyectos',
  'Ventas',
  'Inversiones',
  'Otros ingresos',
]

export interface Transaccion {
  id: string
  fecha: string // YYYY-MM-DD
  tipo: TipoTransaccion
  categoria: Categoria
  monto: number // positive number always
  nota?: string
}

export interface Presupuesto {
  id: string
  categoria: CategoriaGasto
  monto: number
  mes: string // YYYY-MM
}

export interface DiaActivo {
  fecha: string // YYYY-MM-DD
  porTransaccion: boolean
  porCheckIn: boolean
}

export interface Logro {
  id: string
  nombre: string
  descripcion: string
  icono: string
  desbloqueadoEn?: string // ISO timestamp
}

export interface EstadisticasMes {
  totalIngresos: number
  totalGastos: number
  balance: number
  porCategoria: Record<string, number>
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export interface Habito {
  id: string
  nombre: string
  emoji: string
  color: string // hex color
  activo: boolean
  creadoEn: string // YYYY-MM-DD
}

export interface RegistroHabito {
  fecha: string // YYYY-MM-DD
  habitoId: string
}

export interface EstadoDia {
  fecha: string // YYYY-MM-DD
  estado: 1 | 2 | 3 | 4 | 5 // mood: 1=terrible → 5=excelente
  motivacion: 1 | 2 | 3 | 4 | 5 // 1=sin ganas → 5=al 100
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export type PrioridadTarea = 'Alta' | 'Media' | 'Baja' | 'Opcional'
export type EstadoTarea = 'Sin empezar' | 'En progreso' | 'Completada' | 'Cancelada'

export const CATEGORIAS_TAREA = [
  'Trabajo',
  'Personal',
  'Salud',
  'Finanzas',
  'Educación',
  'Hogar',
  'Otro',
] as const

export type CategoriaTarea = typeof CATEGORIAS_TAREA[number]

export interface Tarea {
  id: string
  titulo: string
  descripcion?: string
  fechaVencimiento?: string // YYYY-MM-DD
  prioridad: PrioridadTarea
  estado: EstadoTarea
  categoria: CategoriaTarea
  creadaEn: string // YYYY-MM-DD
}

// ─── Weekly planner ───────────────────────────────────────────────────────────

export interface DiaSemana {
  notas: string
  mejoras: string
  gratitud: string
}

export interface RegistroSemanal {
  semana: string // YYYY-MM-DD of Monday
  dias: Record<string, DiaSemana> // date YYYY-MM-DD → DiaSemana
}

// ─── Debts ────────────────────────────────────────────────────────────────────

export type TipoDeuda = 'Préstamo' | 'Tarjeta de crédito' | 'Hipoteca' | 'Otro'

export interface Deuda {
  id: string
  nombre: string
  tipo: TipoDeuda
  montoTotal: number
  montoRestante: number
  tasaInteres?: number // annual %
  fechaVencimiento?: string // YYYY-MM-DD
  cuotaMensual?: number
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export type Rango = 'Novato' | 'Aprendiz' | 'Bronce' | 'Plata' | 'Oro' | 'Platino' | 'Esmeralda' | 'Zafiro' | 'Diamante' | 'Élite'

export type ObjetivoUsuario = 'ahorrar' | 'controlar' | 'deudas' | 'invertir' | 'libertad'

export interface PerfilUsuario {
  nombre: string
  objetivo: ObjetivoUsuario
  obstaculo: string
  intereses: string[]
  onboardingCompletado: boolean
  creadoEn: string // YYYY-MM-DD
}

export interface EventoXP {
  fecha: string // YYYY-MM-DD
  cantidad: number
  motivo: string
}

export interface EstadoXP {
  total: number
  historial: EventoXP[] // last 100
}

// ─── App state ────────────────────────────────────────────────────────────────

export interface AppState {
  transacciones: Transaccion[]
  presupuestos: Presupuesto[]
  diasActivos: DiaActivo[]
  logros: Logro[]
  ultimoCheckIn: string | null // YYYY-MM-DD
  habitos: Habito[]
  registrosHabito: RegistroHabito[]
  estadosDia: EstadoDia[]
  tareas: Tarea[]
  registrosSemanal: RegistroSemanal[]
  deudas: Deuda[]
  perfil: PerfilUsuario | null
  xp: EstadoXP
}

export type AppAction =
  | { type: 'ADD_TRANSACCION'; payload: Transaccion }
  | { type: 'EDIT_TRANSACCION'; payload: Transaccion }
  | { type: 'DELETE_TRANSACCION'; payload: string }
  | { type: 'ADD_PRESUPUESTO'; payload: Presupuesto }
  | { type: 'EDIT_PRESUPUESTO'; payload: Presupuesto }
  | { type: 'DELETE_PRESUPUESTO'; payload: string }
  | { type: 'CARGAR_DEMO'; payload: {
      transacciones: Transaccion[]
      diasActivos: DiaActivo[]
      deudas?: Deuda[]
      xpEvents?: EventoXP[]
      habitos?: Habito[]
      registrosHabito?: RegistroHabito[]
      estadosDia?: EstadoDia[]
      tareas?: Tarea[]
      registrosSemanal?: RegistroSemanal[]
      perfil?: PerfilUsuario
      ultimoCheckIn?: string
      presupuestos?: Presupuesto[]
    } }
  | { type: 'ADD_DIA_ACTIVO'; payload: DiaActivo }
  | { type: 'CHECKIN_HOY'; payload: string }
  | { type: 'DESBLOQUEAR_LOGRO'; payload: Logro }
  | { type: 'RESET_DATOS' }
  // Habits
  | { type: 'ADD_HABITO'; payload: Habito }
  | { type: 'EDIT_HABITO'; payload: Habito }
  | { type: 'DELETE_HABITO'; payload: string }
  | { type: 'TOGGLE_REGISTRO_HABITO'; payload: { fecha: string; habitoId: string } }
  | { type: 'SET_ESTADO_DIA'; payload: EstadoDia }
  // Tasks
  | { type: 'ADD_TAREA'; payload: Tarea }
  | { type: 'EDIT_TAREA'; payload: Tarea }
  | { type: 'DELETE_TAREA'; payload: string }
  // Weekly
  | { type: 'UPDATE_DIA_SEMANAL'; payload: { semana: string; fecha: string; dia: DiaSemana } }
  // Debts
  | { type: 'ADD_DEUDA'; payload: Deuda }
  | { type: 'EDIT_DEUDA'; payload: Deuda }
  | { type: 'DELETE_DEUDA'; payload: string }
  // Gamification
  | { type: 'COMPLETAR_ONBOARDING'; payload: PerfilUsuario }
  | { type: 'ADD_XP'; payload: EventoXP }
