import { useEffect, useState } from 'react'
import { AlertTriangle, ExternalLink, Pencil, Search, Trash2, Video } from 'lucide-react'
import type { Ejercicio } from '../../types'
import { db } from '../../db'
import { analizarVideo, busquedaYoutube, comprobarYoutube, esUrlValida, NOMBRE_PLATAFORMA } from '../../lib/video'
import { Button } from '../ui/Button'

export function VideoEjercicio({ ejercicio }: { ejercicio: Ejercicio }) {
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(ejercicio.videoUrl ?? '')
  const [roto, setRoto] = useState(false)
  const info = ejercicio.videoUrl ? analizarVideo(ejercicio.videoUrl) : null

  useEffect(() => {
    setRoto(false)
    if (info?.youtubeId) comprobarYoutube(info.youtubeId).then((ok) => setRoto(ok === false))
  }, [info?.youtubeId])

  async function guardar() {
    const url = texto.trim()
    await db.ejercicios.update(ejercicio.id, { videoUrl: url || undefined })
    setEditando(false)
  }

  async function quitar() {
    await db.ejercicios.update(ejercicio.id, { videoUrl: undefined })
    setTexto('')
  }

  if (editando) {
    const valido = !texto.trim() || esUrlValida(texto)
    const previa = valido && texto.trim() ? analizarVideo(texto) : null
    return (
      <div className="space-y-2">
        <input
          type="url"
          inputMode="url"
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pega un enlace de YouTube, TikTok o Instagram"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-500"
        />
        {!valido && <p className="text-xs text-red-400">El enlace no es válido.</p>}
        {previa && (
          <p className="text-xs text-gray-400">
            Detectado: {NOMBRE_PLATAFORMA[previa.plataforma]}
            {previa.embed ? ' · se verá dentro de la app' : ' · se abrirá fuera de la app'}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setEditando(false)}>Cancelar</Button>
          <Button onClick={guardar} disabled={!valido}>Guardar</Button>
        </div>
      </div>
    )
  }

  if (!info) {
    return (
      <div className="space-y-2">
        <a
          href={busquedaYoutube(ejercicio.nombre)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl py-3 text-sm"
        >
          <Search size={18} /> Buscar vídeo de técnica en YouTube
        </a>
        <Button variant="secondary" fullWidth onClick={() => setEditando(true)} className="flex items-center justify-center gap-2">
          <Video size={18} /> Añadir enlace de vídeo
        </Button>
        <p className="text-xs text-gray-500">
          Copia el enlace de un Short, TikTok o Reel que te guste y pégalo aquí para tenerlo siempre a mano.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {roto && (
        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded-xl p-3 text-sm">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>Este vídeo ya no está disponible. Sustitúyelo por otro enlace.</span>
        </div>
      )}
      {info.embed && !roto ? (
        <div className={`relative w-full overflow-hidden rounded-2xl bg-black ${info.plataforma === 'youtube' ? 'aspect-[9/16] max-h-[70vh] mx-auto' : 'aspect-[9/16]'}`}>
          <iframe
            src={info.embed}
            title={`Vídeo de ${ejercicio.nombre}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        !roto && (
          <p className="text-sm text-gray-400">
            {NOMBRE_PLATAFORMA[info.plataforma]} no permite ver este enlace dentro de la app.
          </p>
        )
      )}
      <a
        href={info.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl py-3 text-sm"
      >
        <ExternalLink size={18} /> Abrir en {NOMBRE_PLATAFORMA[info.plataforma]}
      </a>
      <p className="text-xs text-gray-500 text-center">¿No se ve o ya no funciona? Sustitúyelo:</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant={roto ? 'primary' : 'secondary'} onClick={() => setEditando(true)} className="flex items-center justify-center gap-2">
          <Pencil size={16} /> Cambiar
        </Button>
        <Button variant="ghost" onClick={quitar} className="flex items-center justify-center gap-2">
          <Trash2 size={16} /> Quitar
        </Button>
      </div>
    </div>
  )
}
