import { useEffect, useState } from 'react'
import { ImageOff, Pause, Play } from 'lucide-react'
import type { Ejercicio } from '../../types'
import { useImagen } from '../../lib/imagenes'

export function Ilustracion({ ejercicio }: { ejercicio: Ejercicio }) {
  const [fase, setFase] = useState(0)
  const [animando, setAnimando] = useState(true)
  const inicio = useImagen(ejercicio.foto ?? ejercicio.imagenes[0])
  const fin = useImagen(ejercicio.foto ? undefined : ejercicio.imagenes[1])
  const animable = !ejercicio.foto && !!fin

  useEffect(() => {
    if (!animable || !animando) return
    const t = setInterval(() => setFase((f) => 1 - f), 1000)
    return () => clearInterval(t)
  }, [animable, animando])

  if (!inicio) {
    return (
      <div className="aspect-[4/3] bg-gray-800 rounded-2xl flex flex-col items-center justify-center text-gray-500 gap-2">
        <ImageOff size={36} />
        <span className="text-xs">Sin imagen (¿sin conexión?)</span>
      </div>
    )
  }

  return (
    <div className="relative aspect-[4/3] bg-white rounded-2xl overflow-hidden">
      <img src={inicio} alt="Posición inicial" className="absolute inset-0 w-full h-full object-contain" />
      {animable && (
        <img
          src={fin}
          alt="Posición final"
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${fase ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {animable && (
        <>
          <span className="absolute left-2 bottom-2 text-[11px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full">
            {fase ? 'Final' : 'Inicio'}
          </span>
          <button
            onClick={() => setAnimando((a) => !a)}
            aria-label={animando ? 'Pausar animación' : 'Reanudar animación'}
            className="absolute right-2 bottom-2 bg-black/60 text-white p-2 rounded-full"
          >
            {animando ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </>
      )}
    </div>
  )
}

export function Miniatura({ ejercicio }: { ejercicio: Ejercicio }) {
  const src = useImagen(ejercicio.foto ?? ejercicio.imagenes[0])
  return (
    <div className="w-16 h-16 shrink-0 rounded-xl bg-white overflow-hidden flex items-center justify-center">
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-700" />
      )}
    </div>
  )
}
