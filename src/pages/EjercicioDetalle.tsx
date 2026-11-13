import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { AlertCircle, Languages, Pencil, Trash2 } from 'lucide-react'
import { db } from '../db'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Ilustracion } from '../components/ejercicio/Ilustracion'
import { VideoEjercicio } from '../components/ejercicio/VideoEjercicio'
import { EQUIPOS, MUSCULOS } from '../lib/etiquetas'

export function EjercicioDetalle() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const ejercicio = useLiveQuery(() => db.ejercicios.get(id), [id])

  if (ejercicio === undefined) return <PageHeader title="" back />
  if (!ejercicio) {
    return (
      <>
        <PageHeader title="Ejercicio" back />
        <p className="text-center text-gray-500 py-10">Este ejercicio no existe.</p>
      </>
    )
  }

  async function borrar() {
    const usado = (await db.rutinas.toArray()).some((r) => r.ejercicios.some((x) => x.ejercicioId === id))
    const aviso = usado
      ? 'Este ejercicio está en alguna rutina y se quitará de ella. ¿Borrarlo?'
      : '¿Borrar este ejercicio?'
    if (!confirm(aviso)) return
    await db.transaction('rw', db.ejercicios, db.rutinas, async () => {
      await db.ejercicios.delete(id)
      if (usado) {
        await db.rutinas.toCollection().modify((r) => {
          r.ejercicios = r.ejercicios.filter((x) => x.ejercicioId !== id)
        })
      }
    })
    navigate('/ejercicios', { replace: true })
  }

  const traductor = `https://translate.google.com/?sl=en&tl=es&op=translate&text=${encodeURIComponent(
    ejercicio.instrucciones.join('\n')
  )}`

  return (
    <>
      <PageHeader
        title={ejercicio.nombre}
        subtitle={ejercicio.nombreOriginal}
        back
        action={
          ejercicio.esPersonalizado && (
            <div className="flex gap-1">
              <Link to={`/ejercicios/${encodeURIComponent(id)}/editar`} aria-label="Editar" className="p-2 text-gray-300">
                <Pencil size={20} />
              </Link>
              <button onClick={borrar} aria-label="Borrar" className="p-2 text-red-400">
                <Trash2 size={20} />
              </button>
            </div>
          )
        }
      />
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Ilustracion ejercicio={ejercicio} />

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-300 text-sm font-semibold">
            {MUSCULOS[ejercicio.musculoPrincipal]}
          </span>
          {ejercicio.musculosSecundarios.map((m) => (
            <span key={m} className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-sm">
              {MUSCULOS[m]}
            </span>
          ))}
          <span className="px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-300 text-sm">
            {EQUIPOS[ejercicio.equipamiento]}
          </span>
        </div>

        <Card>
          <h2 className="font-semibold mb-3">Vídeo de técnica</h2>
          <VideoEjercicio ejercicio={ejercicio} />
        </Card>

        {ejercicio.instrucciones.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Cómo se hace</h2>
              {ejercicio.idioma === 'en' && (
                <a href={traductor} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-indigo-400">
                  <Languages size={16} /> Traducir
                </a>
              )}
            </div>
            {ejercicio.idioma === 'en' && (
              <p className="text-xs text-gray-500 mb-3">Instrucciones originales en inglés.</p>
            )}
            <ol className="space-y-3">
              {ejercicio.instrucciones.map((paso, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-200">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{paso}</span>
                </li>
              ))}
            </ol>
          </Card>
        )}

        {ejercicio.erroresComunes.length > 0 && (
          <Card>
            <h2 className="font-semibold mb-3">Errores comunes</h2>
            <ul className="space-y-2">
              {ejercicio.erroresComunes.map((err, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-200">
                  <AlertCircle size={18} className="shrink-0 text-red-400" />
                  <span>{err}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </main>
    </>
  )
}
