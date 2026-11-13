import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ImageDown } from 'lucide-react'
import { db } from '../../db'
import { descargarTodas } from '../../lib/imagenes'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

export function ImagenesSinConexion() {
  const guardadas = useLiveQuery(() => db.imagenes.count())
  const total = useLiveQuery(async () => (await db.ejercicios.toArray()).reduce((n, e) => n + e.imagenes.length, 0))
  const [progreso, setProgreso] = useState<{ hechas: number; total: number } | null>(null)
  const [resultado, setResultado] = useState<string | null>(null)
  const abortar = useRef<AbortController | null>(null)

  async function empezar() {
    setResultado(null)
    abortar.current = new AbortController()
    const r = await descargarTodas((hechas, t) => setProgreso({ hechas, total: t }), abortar.current.signal)
    setProgreso(null)
    setResultado(
      r.fallidas
        ? `${r.fallidas} imágenes no se pudieron descargar. Revisa la conexión y vuelve a intentarlo.`
        : 'Todas las imágenes están guardadas en el móvil.'
    )
  }

  const completo = guardadas !== undefined && total !== undefined && guardadas >= total

  return (
    <Card>
      <div className="flex items-start gap-3">
        <ImageDown className="text-indigo-400 shrink-0" size={24} />
        <div className="flex-1">
          <h2 className="font-semibold">Imágenes sin conexión</h2>
          <p className="text-sm text-gray-400 mt-1">
            {guardadas ?? 0} de {total ?? '…'} imágenes guardadas. Las que veas se guardan solas; descárgalas todas
            (unos 70 MB) con wifi para tener la biblioteca completa sin internet.
          </p>
          {progreso ? (
            <div className="mt-3 space-y-2">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all"
                  style={{ width: `${progreso.total ? (progreso.hechas / progreso.total) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{progreso.hechas} / {progreso.total}</span>
                <button onClick={() => abortar.current?.abort()} className="text-red-400 font-semibold">Detener</button>
              </div>
            </div>
          ) : (
            !completo && (
              <Button size="sm" variant="secondary" className="mt-3" onClick={empezar}>
                Descargar todas
              </Button>
            )
          )}
          {resultado && <p className="text-sm text-gray-300 mt-2">{resultado}</p>}
        </div>
      </div>
    </Card>
  )
}
