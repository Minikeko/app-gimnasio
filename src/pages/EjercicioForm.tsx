import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, X } from 'lucide-react'
import { db } from '../db'
import type { Equipment, MuscleGroup } from '../types'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { EQUIPOS, LISTA_EQUIPOS, LISTA_MUSCULOS, MUSCULOS } from '../lib/etiquetas'
import { comprimirFoto } from '../lib/imagenes'
import { esUrlValida } from '../lib/video'

const campo = 'w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-500'

function lineas(texto: string) {
  return texto.split('\n').map((l) => l.trim()).filter(Boolean)
}

export function EjercicioForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const inputFoto = useRef<HTMLInputElement>(null)
  const [nombre, setNombre] = useState('')
  const [musculo, setMusculo] = useState<MuscleGroup>('pecho')
  const [secundarios, setSecundarios] = useState<MuscleGroup[]>([])
  const [equipo, setEquipo] = useState<Equipment>('maquina')
  const [foto, setFoto] = useState<string>()
  const [video, setVideo] = useState('')
  const [pasos, setPasos] = useState('')
  const [errores, setErrores] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!id) return
    db.ejercicios.get(id).then((e) => {
      if (!e) return
      setNombre(e.nombre)
      setMusculo(e.musculoPrincipal)
      setSecundarios(e.musculosSecundarios)
      setEquipo(e.equipamiento)
      setFoto(e.foto)
      setVideo(e.videoUrl ?? '')
      setPasos(e.instrucciones.join('\n'))
      setErrores(e.erroresComunes.join('\n'))
    })
  }, [id])

  async function elegirFoto(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    ev.target.value = ''
    if (file) setFoto(await comprimirFoto(file))
  }

  function alternarSecundario(m: MuscleGroup) {
    setSecundarios((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]))
  }

  const videoValido = !video.trim() || esUrlValida(video)
  const valido = nombre.trim().length > 0 && videoValido

  async function guardar() {
    if (!valido) return
    setGuardando(true)
    const nuevoId = id ?? `custom-${crypto.randomUUID()}`
    await db.ejercicios.put({
      id: nuevoId,
      nombre: nombre.trim(),
      musculoPrincipal: musculo,
      musculosSecundarios: secundarios.filter((m) => m !== musculo),
      equipamiento: equipo,
      instrucciones: lineas(pasos),
      erroresComunes: lineas(errores),
      idioma: 'es',
      imagenes: [],
      foto,
      videoUrl: video.trim() || undefined,
      esPersonalizado: true,
    })
    navigate(`/ejercicios/${encodeURIComponent(nuevoId)}`, { replace: true })
  }

  return (
    <>
      <PageHeader title={id ? 'Editar ejercicio' : 'Nuevo ejercicio'} back />
      <main className="max-w-lg mx-auto px-4 py-4 space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2">Foto</label>
          {foto ? (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-800">
              <img src={foto} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setFoto(undefined)} aria-label="Quitar foto" className="absolute top-2 right-2 bg-black/60 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputFoto.current?.click()}
              className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center gap-2 text-gray-400"
            >
              <Camera size={32} />
              <span className="text-sm">Hacer foto o elegir de la galería</span>
            </button>
          )}
          <input ref={inputFoto} type="file" accept="image/*" className="hidden" onChange={elegirFoto} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="nombre">Nombre *</label>
          <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Press en máquina convergente" className={campo} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="musculo">Músculo principal</label>
          <select id="musculo" value={musculo} onChange={(e) => setMusculo(e.target.value as MuscleGroup)} className={campo}>
            {LISTA_MUSCULOS.map((m) => <option key={m} value={m}>{MUSCULOS[m]}</option>)}
          </select>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Músculos secundarios</p>
          <div className="flex flex-wrap gap-2">
            {LISTA_MUSCULOS.filter((m) => m !== musculo).map((m) => (
              <Chip key={m} activo={secundarios.includes(m)} onClick={() => alternarSecundario(m)}>{MUSCULOS[m]}</Chip>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="equipo">Equipamiento</label>
          <select id="equipo" value={equipo} onChange={(e) => setEquipo(e.target.value as Equipment)} className={campo}>
            {LISTA_EQUIPOS.map((e) => <option key={e} value={e}>{EQUIPOS[e]}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="video">Vídeo (YouTube, TikTok o Instagram)</label>
          <input id="video" type="url" inputMode="url" value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://…" className={campo} />
          {!videoValido && <p className="text-xs text-red-400 mt-1">El enlace no es válido.</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="pasos">Instrucciones (un paso por línea)</label>
          <textarea id="pasos" rows={4} value={pasos} onChange={(e) => setPasos(e.target.value)} className={campo} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="errores">Errores comunes (uno por línea)</label>
          <textarea id="errores" rows={3} value={errores} onChange={(e) => setErrores(e.target.value)} className={campo} />
        </div>

        <Button size="lg" fullWidth onClick={guardar} disabled={!valido || guardando}>
          Guardar ejercicio
        </Button>
      </main>
    </>
  )
}
