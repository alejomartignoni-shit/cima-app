import { AppLayout } from '../components/layout/AppLayout'
import { Settings, Database, Trash2, Download, MonitorDown, CheckCircle } from 'lucide-react'
import { useApp } from '../store/AppContext'
import {
  transaccionesDemo, generarDiasActivosDemo, deudasDemo, xpEventosDemo,
  habitosDemo, registrosHabitoDemo, estadosDiaDemo, tareasDemo,
  registrosSemanalesDemo, perfilDemo, presupuestosDemo, dashboardsDemo,
} from '../utils/demoData'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { toast } from 'sonner'

export function Configuracion() {
  const { state, dispatch } = useApp()
  const { puedeInstalar, instalada, instalar } = useInstallPrompt()

  function cargarDemoData() {
    dispatch({
      type: 'CARGAR_DEMO',
      payload: {
        transacciones: transaccionesDemo,
        diasActivos: generarDiasActivosDemo(),
        deudas: deudasDemo,
        xpEvents: xpEventosDemo,
        habitos: habitosDemo,
        registrosHabito: registrosHabitoDemo,
        estadosDia: estadosDiaDemo,
        tareas: tareasDemo,
        registrosSemanal: registrosSemanalesDemo,
        perfil: perfilDemo,
        ultimoCheckIn: new Date().toISOString().split('T')[0],
        presupuestos: presupuestosDemo,
        dashboards: dashboardsDemo,
      },
    })
    toast.success('¡Datos de ejemplo cargados!', {
      description: `Rango Élite · Racha 91 días · 6 hábitos · ${tareasDemo.length} tareas`,
    })
  }

  function exportarDatos() {
    const datos = JSON.stringify(state, null, 2)
    const blob = new Blob([datos], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cima-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Datos exportados')
  }

  function resetearDatos() {
    if (!confirm('¿Seguro que querés borrar todos los datos? Esta acción no se puede deshacer.')) return
    dispatch({ type: 'RESET_DATOS' })
    toast.success('Datos eliminados')
  }

  return (
    <AppLayout titulo="Configuración">
      <div className="space-y-6 max-w-lg animate-fade-in">
        {/* Install as app */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          <div className="p-4">
            <h3 className="text-zinc-300 font-medium text-sm mb-3">Instalar en el escritorio</h3>
            {instalada ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle size={16} />
                <span>App instalada en tu dispositivo</span>
              </div>
            ) : puedeInstalar ? (
              <>
                <p className="text-zinc-500 text-xs mb-3">
                  Instalá CIMA como una app independiente. Abre sin el navegador y queda en tu escritorio.
                </p>
                <button
                  onClick={instalar}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors active:scale-95"
                >
                  <MonitorDown size={16} />
                  Instalar CIMA
                </button>
              </>
            ) : (
              <p className="text-zinc-500 text-xs">
                Abrí CIMA en Chrome o Edge y hacé clic en el ícono de instalación en la barra de direcciones.
              </p>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-1">
              <Settings size={16} className="text-zinc-400" />
              <h3 className="text-white font-medium text-sm">Configuración general</h3>
            </div>
            <p className="text-zinc-500 text-xs pl-7">CIMA v0.1 — Datos guardados localmente en tu dispositivo</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          <div className="p-4">
            <h3 className="text-zinc-300 font-medium text-sm mb-3">Datos de ejemplo</h3>
            <p className="text-zinc-500 text-xs mb-4">
              Cargá transacciones de ejemplo con montos reales argentinos 2026 para explorar la app.
              Esto reemplazará tus datos actuales.
            </p>
            <button
              onClick={cargarDemoData}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors active:scale-95"
            >
              <Database size={16} />
              Cargar datos de ejemplo
            </button>
            <p className="text-zinc-600 text-xs mt-2">
              {state.transacciones.length} transacciones cargadas actualmente
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          <div className="p-4">
            <h3 className="text-zinc-300 font-medium text-sm mb-3">Exportar datos</h3>
            <button
              onClick={exportarDatos}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              <Download size={16} />
              Exportar JSON
            </button>
          </div>

          <div className="p-4">
            <h3 className="text-rose-400 font-medium text-sm mb-3">Zona peligrosa</h3>
            <button
              onClick={resetearDatos}
              className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-medium text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Borrar todos los datos
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
