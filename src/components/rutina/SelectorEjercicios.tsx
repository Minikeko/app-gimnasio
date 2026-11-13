import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, Search, X } from 'lucide-react'
import { db } from '../../db'
import type { Equipment, MuscleGroup } from '../../types'
import { filtrarEjercicios } from '../../lib/busqueda'
import { EQUIPOS, LISTA_EQUIPOS, LISTA_MUSCULOS, MUSCULOS } from '../../lib/etiquetas'
import { Chip } from '../ui/Chip'
import { Button } from '../ui/Button'
import { Miniatura } from '../ejercicio/Ilustracion'

const PASO = 40

interface Props {
  onCerrar: () => void
  onAnadir: (ids: string[]) => void
}

export function SelectorEjercicios({ onCerrar, onAnadir }: Props) {
  const todos = useLiveQuery(() => db.ejercicios.toArray())
  const [q, setQ] = useState('')
  const [musculo, setMusculo] = useState<MuscleGroup | null>(null)
  const [equipo, setEquipo] = useState<Equipment | null>(null)
  const [elegidos, setElegidos] = useState<string[]>([])
  const [visibles, setVisibles] = useState(PASO)

  const lista = useMemo(
    () => (todos ? filtrarEjercicios(todos, { q, musculo, equipo }) : []),
    [todos, q, musculo, equipo]
  )

  function alternar(id: string) {
    setElegidos((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]))
  }

  return (
    <div className="fixed inset-0 z-[60] bg-gray-900 flex flex-col">
      <header className="safe-top border-b border-gray-800">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto w-full">
          <button onClick={onCerrar} aria-label="Cerrar" className="p-2 -ml-2 text-gray-400">
            <X size={22} />
          </button>
          <h2 className="flex-1 text-lg font-bold">Añadir ejercicios</h2>
        </div>
        <div className="max-w-lg mx-auto w-full px-4 pb-2 space-y-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setVisibles(PASO)
              }}
              placeholder="Buscar ejercicio…"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {LISTA_MUSCULOS.map((m) => (
              <Chip key={m} activo={musculo === m} onClick={() => { setMusculo(musculo === m ? null : m); setVisibles(PASO) }}>
                {MUSCULOS[m]}
              </Chip>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {LISTA_EQUIPOS.map((e) => (
              <Chip key={e} activo={equipo === e} onClick={() => { setEquipo(equipo === e ? null : e); setVisibles(PASO) }}>
                {EQUIPOS[e]}
              </Chip>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <ul className="max-w-lg mx-auto px-4 py-3 space-y-2">
          {lista.slice(0, visibles).map((e) => {
            const marcado = elegidos.includes(e.id)
            return (
              <li key={e.id}>
                <button
                  onClick={() => alternar(e.id)}
                  className={`flex items-center gap-3 w-full text-left rounded-2xl p-2 pr-3 border ${
                    marcado ? 'bg-indigo-600/20 border-indigo-500' : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <Miniatura ejercicio={e} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight line-clamp-2">{e.nombre}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {MUSCULOS[e.musculoPrincipal]} · {EQUIPOS[e.equipamiento]}
                    </p>
                  </div>
                  <span
                    className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center ${
                      marcado ? 'bg-indigo-600 border-indigo-600' : 'border-gray-600'
                    }`}
                  >
                    {marcado && <Check size={16} />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {visibles < lista.length && (
          <div className="max-w-lg mx-auto px-4 pb-4">
            <Button variant="secondary" fullWidth onClick={() => setVisibles((v) => v + PASO)}>
              Ver más ({lista.length - visibles})
            </Button>
          </div>
        )}
      </div>

      <footer className="border-t border-gray-800 p-4 safe-bottom">
        <div className="max-w-lg mx-auto">
          <Button size="lg" fullWidth disabled={!elegidos.length} onClick={() => onAnadir(elegidos)}>
            {elegidos.length ? `Añadir ${elegidos.length} ${elegidos.length === 1 ? 'ejercicio' : 'ejercicios'}` : 'Elige ejercicios'}
          </Button>
        </div>
      </footer>
    </div>
  )
}
