import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Search, X, User } from 'lucide-react'
import { db } from '../db'
import type { Equipment, MuscleGroup } from '../types'
import { PageHeader } from '../components/layout/PageHeader'
import { Chip } from '../components/ui/Chip'
import { Miniatura } from '../components/ejercicio/Ilustracion'
import { EQUIPOS, LISTA_EQUIPOS, LISTA_MUSCULOS, MUSCULOS } from '../lib/etiquetas'

const PASO = 30

function normalizar(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function Ejercicios() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const musculo = params.get('m') as MuscleGroup | null
  const equipo = params.get('e') as Equipment | null
  const soloMios = params.get('mios') === '1'
  const [visibles, setVisibles] = useState(PASO)
  const centinela = useRef<HTMLDivElement>(null)

  const todos = useLiveQuery(() => db.ejercicios.toArray())

  function setParam(clave: string, valor: string | null) {
    const p = new URLSearchParams(params)
    if (valor) p.set(clave, valor)
    else p.delete(clave)
    setParams(p, { replace: true })
  }

  const filtrados = useMemo(() => {
    if (!todos) return []
    const palabras = normalizar(q).split(/\s+/).filter(Boolean)
    return todos
      .filter((e) => {
        if (musculo && e.musculoPrincipal !== musculo && !e.musculosSecundarios.includes(musculo)) return false
        if (equipo && e.equipamiento !== equipo) return false
        if (soloMios && !e.esPersonalizado) return false
        if (!palabras.length) return true
        const es = normalizar(e.nombre)
        const en = normalizar(e.nombreOriginal ?? '')
        return palabras.every((p) => es.includes(p)) || palabras.every((p) => en.includes(p))
      })
      .sort((a, b) => {
        if (musculo && (a.musculoPrincipal === musculo) !== (b.musculoPrincipal === musculo)) {
          return a.musculoPrincipal === musculo ? -1 : 1
        }
        if (a.esPersonalizado !== b.esPersonalizado) return a.esPersonalizado ? -1 : 1
        if (a.idioma !== b.idioma) return a.idioma === 'es' ? -1 : 1
        return a.nombre.localeCompare(b.nombre, 'es')
      })
  }, [todos, q, musculo, equipo, soloMios])

  useEffect(() => setVisibles(PASO), [q, musculo, equipo, soloMios])

  useEffect(() => {
    const el = centinela.current
    if (!el) return
    const obs = new IntersectionObserver((entradas) => {
      if (entradas[0].isIntersecting) setVisibles((v) => v + PASO)
    }, { rootMargin: '400px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [filtrados.length])

  return (
    <>
      <PageHeader
        title="Ejercicios"
        subtitle={todos ? `${filtrados.length} de ${todos.length}` : 'Cargando…'}
        action={
          <Link
            to="/ejercicios/nuevo"
            aria-label="Crear ejercicio"
            className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-semibold px-3 py-2 rounded-xl"
          >
            <Plus size={18} /> Nuevo
          </Link>
        }
      />
      <div
        className="sticky z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800"
        style={{ top: 'calc(3.5rem + env(safe-area-inset-top))' }}
      >
        <div className="max-w-lg mx-auto px-4 pt-3 pb-2 space-y-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              value={q}
              onChange={(e) => setParam('q', e.target.value || null)}
              placeholder="Buscar ejercicio…"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
            {q && (
              <button onClick={() => setParam('q', null)} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            <Chip activo={!musculo} onClick={() => setParam('m', null)}>Todos</Chip>
            {LISTA_MUSCULOS.map((m) => (
              <Chip key={m} activo={musculo === m} onClick={() => setParam('m', musculo === m ? null : m)}>
                {MUSCULOS[m]}
              </Chip>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            <Chip activo={soloMios} onClick={() => setParam('mios', soloMios ? null : '1')}>
              <span className="flex items-center gap-1"><User size={14} /> Míos</span>
            </Chip>
            {LISTA_EQUIPOS.map((e) => (
              <Chip key={e} activo={equipo === e} onClick={() => setParam('e', equipo === e ? null : e)}>
                {EQUIPOS[e]}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-3">
        {todos && filtrados.length === 0 && (
          <p className="text-center text-gray-500 py-10">No hay ejercicios con estos filtros.</p>
        )}
        <ul className="space-y-2">
          {filtrados.slice(0, visibles).map((e) => (
            <li key={e.id}>
              <Link
                to={`/ejercicios/${encodeURIComponent(e.id)}`}
                className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl p-2 pr-3 active:bg-gray-700"
              >
                <Miniatura ejercicio={e} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight line-clamp-2">{e.nombre}</p>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {MUSCULOS[e.musculoPrincipal]} · {EQUIPOS[e.equipamiento]}
                    {e.esPersonalizado && ' · Personalizado'}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {visibles < filtrados.length && <div ref={centinela} className="h-10" />}
      </main>
    </>
  )
}
