import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls.js'
import { X, RotateCcw } from 'lucide-react'

export type MerchProductId = 'hoodie'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Colors { body: string; accent: string }
interface Colorway { name: string; colors: Colors }

// ── Colorway presets ──────────────────────────────────────────────────────────
const COLORWAYS: Colorway[] = [
  { name: 'Negro Total',    colors: { body: '#111111', accent: '#1e1e1e' } },
  { name: 'Gris Carbono',   colors: { body: '#2a2a2e', accent: '#1e1e22' } },
  { name: 'Azul Royal',     colors: { body: '#1a3566', accent: '#0f2040' } },
  { name: 'Verde Élite',    colors: { body: '#0f3020', accent: '#081c12' } },
  { name: 'Gris Titanio',   colors: { body: '#4a4a52', accent: '#2e2e35' } },
  { name: 'Burdó',          colors: { body: '#5c1a24', accent: '#3a0f17' } },
]

const LAYER_PALETTES: Record<keyof Colors, string[]> = {
  body:   ['#f0f0f0','#111111','#1a3566','#0f3020','#4a4a52','#5c1a24','#6b4c11','#2d1a5c','#0f3a5c','#1a4a3a'],
  accent: ['#d8d8d8','#1e1e1e','#0f2040','#081c12','#2e2e35','#3a0f17','#4a3008','#1e1038','#0a2840','#0f2e24'],
}

const PARTS: Record<keyof Colors, string> = {
  body:   'Hoodie',
  accent: 'Falda',
}

// ── Model path ────────────────────────────────────────────────────────────────
const BASE = import.meta.env.BASE_URL
const MODEL_PATH = `${BASE}models/hoodie-f/scene.gltf`

// ── Material name → color key mapping ────────────────────────────────────────
// "parker" = hoodie body, "skirt" = the skirt/bottom piece
function colorKeyForMat(matName: string): keyof Colors {
  return matName.toLowerCase().includes('skirt') ? 'accent' : 'body'
}

// ── Scene ref ─────────────────────────────────────────────────────────────────
interface SceneState {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  animId: number
  matMap: Map<THREE.MeshStandardMaterial, keyof Colors>
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  productId: MerchProductId
  productName: string
  gold: boolean
  onClose: () => void
}

export function Merch3DViewer({ productName, gold, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<SceneState | null>(null)

  const [cwIdx, setCwIdx] = useState(0)
  const [colors, setColors] = useState<Colors>(COLORWAYS[0].colors)
  const [activeLayer, setActiveLayer] = useState<keyof Colors>('body')
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // ── Init scene ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const el = canvas

    let animId = 0
    let controls: OrbitControlsType | null = null
    let destroyed = false

    async function init() {
      const [{ OrbitControls }, { GLTFLoader }] = await Promise.all([
        import('three/addons/controls/OrbitControls.js'),
        import('three/addons/loaders/GLTFLoader.js'),
      ])
      if (destroyed) return

      // Renderer
      const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(el.clientWidth, el.clientHeight)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.3
      renderer.outputColorSpace = THREE.SRGBColorSpace

      // Scene
      const scene = new THREE.Scene()
      scene.background = new THREE.Color('#0c0c0f')
      scene.fog = new THREE.FogExp2('#0c0c0f', 0.045)

      // Camera
      const camera = new THREE.PerspectiveCamera(38, el.clientWidth / el.clientHeight, 0.1, 80)
      camera.position.set(0, 0.5, 6)

      // Lights
      scene.add(new THREE.AmbientLight('#ffffff', 0.25))
      const key = new THREE.SpotLight('#fff6e0', 130); key.position.set(3.5, 5, 5); key.angle = 0.34; key.penumbra = 0.55; key.castShadow = true; key.shadow.mapSize.setScalar(1024); scene.add(key); scene.add(key.target)
      const fill = new THREE.SpotLight('#b8d4ff', 28); fill.position.set(-3, 3, 4); fill.angle = 0.55; fill.penumbra = 0.8; scene.add(fill)
      const rim = new THREE.SpotLight('#6050e8', 65); rim.position.set(-2, 4, -5); rim.angle = 0.36; rim.penumbra = 0.5; scene.add(rim)
      const top = new THREE.SpotLight('#4040cc', 22); top.position.set(0, 8, -3); top.angle = 0.3; top.penumbra = 0.7; scene.add(top)

      // Shadow plane
      const sp = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.3 }))
      sp.rotation.x = -Math.PI / 2; sp.position.y = -2.5; sp.receiveShadow = true; scene.add(sp)
      // Reflective ground disc
      const gd = new THREE.Mesh(new THREE.CircleGeometry(1.8, 48), new THREE.MeshStandardMaterial({ color: '#14141a', roughness: 0.1, metalness: 0.7 }))
      gd.rotation.x = -Math.PI / 2; gd.position.y = -2.51; scene.add(gd)

      const gltf = await new Promise<{ scene: THREE.Group }>((res, rej) => {
        const loader = new GLTFLoader()
        loader.load(MODEL_PATH, res as never, undefined, rej)
      })
      if (destroyed) return

      const model = gltf.scene
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 3.2 / maxDim

      model.position.sub(center)
      const wrapper = new THREE.Group()
      wrapper.scale.setScalar(scale)
      wrapper.add(model)
      scene.add(wrapper)

      const matMap = new Map<THREE.MeshStandardMaterial, keyof Colors>()
      const initColors = COLORWAYS[0].colors

      model.traverse(n => {
        if (n instanceof THREE.Mesh) {
          n.castShadow = true
          n.receiveShadow = true
          const mat = n.material as THREE.MeshStandardMaterial
          if (mat && mat.isMeshStandardMaterial) {
            const key = colorKeyForMat(mat.name)
            mat.color.set(initColors[key])
            mat.needsUpdate = true
            matMap.set(mat, key)
          }
        }
      })

      // OrbitControls
      controls = new OrbitControls(camera, el)
      controls.enablePan = false
      controls.minDistance = 3; controls.maxDistance = 10
      controls.autoRotate = true; controls.autoRotateSpeed = 0.8
      controls.enableDamping = true; controls.dampingFactor = 0.06
      controls.minPolarAngle = Math.PI * 0.1; controls.maxPolarAngle = Math.PI * 0.85

      // Animate
      let t = 0
      function animate() {
        animId = requestAnimationFrame(animate)
        t += 0.01
        wrapper.position.y = Math.sin(t) * 0.1
        controls!.update()
        renderer.render(scene, camera)
      }
      animate()

      // Resize
      const onResize = () => {
        camera.aspect = el.clientWidth / el.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(el.clientWidth, el.clientHeight)
      }
      window.addEventListener('resize', onResize)

      sceneRef.current = { scene, renderer, camera, animId, matMap }
      setLoaded(true)

      return () => {
        window.removeEventListener('resize', onResize)
        controls?.dispose()
        renderer.dispose()
        scene.traverse(n => {
          if (n instanceof THREE.Mesh) {
            n.geometry.dispose()
            if (Array.isArray(n.material)) n.material.forEach(m => m.dispose())
            else n.material.dispose()
          }
        })
      }
    }

    let cleanup: (() => void) | undefined
    init().then(fn => { cleanup = fn }).catch(err => {
      console.error('Merch3DViewer init error:', err)
      setLoadError(String(err?.message ?? err))
    })
    return () => { destroyed = true; cleanup?.(); cancelAnimationFrame(animId) }
  }, [])

  // ── Live color updates ────────────────────────────────────────────────────────
  useEffect(() => {
    const ref = sceneRef.current
    if (!ref || !loaded) return
    ref.matMap.forEach((key, mat) => {
      mat.color.set(colors[key])
      mat.needsUpdate = true
    })
  }, [colors, loaded])

  // ── UI handlers ───────────────────────────────────────────────────────────────
  function applyColorway(idx: number) {
    setCwIdx(idx); setColors(COLORWAYS[idx].colors)
  }
  function setLayerColor(hex: string) {
    setColors(prev => ({ ...prev, [activeLayer]: hex })); setCwIdx(-1)
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-[#0c0c0f]">
      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-zinc-800/60 bg-[#0e0e12] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-zinc-800/60">
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-1">CIMA × Mentes Millonarias</p>
            <h2 className="text-white font-bold text-base leading-tight">{productName}</h2>
            {gold && <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffd600]/12 border border-[#ffd600]/25 text-[#ffd600]">👑 ÉLITE</span>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-white"><X size={18} /></button>
        </div>

        {/* Colorways */}
        <div className="p-5 border-b border-zinc-800/60">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-3">Colorway</p>
          <div className="flex flex-wrap gap-2.5">
            {COLORWAYS.map((cw, i) => (
              <button key={i} onClick={() => applyColorway(i)} title={cw.name}
                className={`relative w-9 h-9 rounded-full transition-all ${cwIdx === i ? 'ring-2 ring-[#ffd600] ring-offset-2 ring-offset-[#0e0e12] scale-110' : 'hover:scale-110'}`}
                style={{ background: cw.colors.body }}>
                <div className="absolute inset-[3px] rounded-full" style={{ background: cw.colors.accent }} />
              </button>
            ))}
          </div>
          {cwIdx >= 0 && <p className="text-zinc-600 text-xs mt-2">{COLORWAYS[cwIdx]?.name}</p>}
        </div>

        {/* Per-layer color */}
        <div className="p-5 border-b border-zinc-800/60 flex-1 overflow-y-auto">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-3">Personalizar</p>
          <div className="flex flex-col gap-1.5 mb-4">
            {(Object.entries(PARTS) as [keyof Colors, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setActiveLayer(key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeLayer === key ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'}`}>
                <div className="w-5 h-5 rounded-full border-2 border-zinc-600 flex-shrink-0" style={{ background: colors[key] }} />
                <span className="font-medium">{label}</span>
                {activeLayer === key && <span className="ml-auto text-[#ffd600] text-xs">✓</span>}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-semibold mb-2">Color — {PARTS[activeLayer]}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {LAYER_PALETTES[activeLayer].map(hex => (
              <button key={hex} onClick={() => setLayerColor(hex)} title={hex}
                className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${colors[activeLayer] === hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0e0e12] scale-110' : ''}`}
                style={{ background: hex }} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-zinc-700 flex-shrink-0" style={{ background: colors[activeLayer] }} />
            <input type="color" value={colors[activeLayer]} onChange={e => setLayerColor(e.target.value)}
              className="w-8 h-6 cursor-pointer rounded bg-transparent border-0 p-0" />
            <span className="text-zinc-600 text-xs font-mono">{colors[activeLayer].toUpperCase()}</span>
          </div>
        </div>

        {/* Reset */}
        <div className="px-5 py-3 border-b border-zinc-800/60">
          <button onClick={() => { setCwIdx(0); setColors(COLORWAYS[0].colors) }}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
            <RotateCcw size={12} /> Resetear diseño
          </button>
        </div>

        {/* CTA */}
        <div className="p-5">
          {gold ? (
            <button className="w-full bg-[#ffd600] hover:bg-[#ffe033] active:scale-95 text-zinc-950 font-black py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-[#ffd600]/20">
              🎁 Reclamar gratis
            </button>
          ) : (
            <p className="text-zinc-500 text-xs text-center leading-relaxed">
              Alcanzá rango <span className="text-[#ffd600] font-bold">Élite</span> (20,000 XP) para reclamar tu merch gratis
            </p>
          )}
        </div>
      </div>

      {/* ── 3D Canvas ──────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Loading / Error */}
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0c0c0f]">
            {loadError ? (
              <>
                <p className="text-red-400 text-sm font-semibold">Error al cargar</p>
                <p className="text-zinc-600 text-xs max-w-xs text-center">{loadError}</p>
              </>
            ) : (
              <>
                <div className="w-8 h-8 border-2 border-[#ffd600]/30 border-t-[#ffd600] rounded-full animate-spin" />
                <p className="text-zinc-500 text-xs">Cargando modelo 3D…</p>
              </>
            )}
          </div>
        )}

        {/* Hint */}
        {loaded && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm border border-white/8 rounded-full px-4 py-2">
              <p className="text-zinc-500 text-xs">🖱️ Arrastrá para rotar · Scroll para zoom</p>
            </div>
          </div>
        )}

        {/* Bg glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(96,80,232,0.06) 0%, transparent 70%)' }} />
        </div>
      </div>
    </div>
  )
}
