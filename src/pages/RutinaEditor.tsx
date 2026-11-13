import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { db } from '../db'
import type { EjercicioRutina } from '../types'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { DiasSemana } from '../components/rutina/DiasSemana'
import { FilaEjercicio, type ItemRutina } from '../components/rutina/FilaEjercicio'
import { SelectorEjercicios } from '../components/rutina/SelectorEjercicios'
import { useUnidad } from '../lib/unidades'

const COLORES = ['#6366f1', '#ec4899', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#a855f7', '#ef4444']

const conUid = (e: EjercicioRutina): ItemRutina => ({ ...e, uid: crypto.randomUUID() })

export function RutinaEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const unidad = useUnidad()
  const [cargado, setCargado] = useState(!id)
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState(COLORES[0])
  const [dias, setDias] = useState<number[]>([])
  const [items, setItems] = useState<ItemRutina[]>([])
  const [selector, setSelector] = useState(false)
  const [sucio, setSucio] = useState(false)
  const [creadaEn, setCreadaEn] = useState<Date>()

  const ejercicios = useLiveQuery(async () => {
    const lista = await db.ejercicios.bulkGet(items.map((i) => i.ejercicioId))
    return new Map(lista.filter((e) => !!e).map((e) => [e.id, e]))
  }, [items.map((i) => i.ejercicioId).join()])

  useEffect(() => {
    if (!id) return
    db.rutinas.get(id).then((r) => {
      if (r) {
        setNombre(r.nombre)
        setColor(r.color)
        setDias(r.diasSemana)
        setItems([...r.ejercicios].sort((a, b) => a.orden - b.orden).map(conUid))
        setCreadaEn(r.creadaEn)
      }
      setCargado(true)
    })
  }, [id])

  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const marcar = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v)
    setSucio(true)
  }

  function alSoltar({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setItems((lista) => {
      const desde = lista.findIndex((i) => i.uid === active.id)
      const hasta = lista.findIndex((i) => i.uid === over.id)
      return arrayMove(lista, desde, hasta)
    })
    setSucio(true)
  }

  function anadir(ids: string[]) {
    setItems((lista) => [
      ...lista,
      ...ids.map((ejercicioId) =>
        conUid({ ejercicioId, orden: 0, series: 3, repeticiones: '10', pesoObjetivoKg: 0, descansoSegundos: 90, notas: '' })
      ),
    ])
    setSelector(false)
    setSucio(true)
  }

  const series = useMemo(() => items.reduce((n, i) => n + i.series, 0), [items])

  async function guardar() {
    const ahora = new Date()
    const rutinaId = id ?? crypto.randomUUID()
    await db.rutinas.put({
      id: rutinaId,
      nombre: nombre.trim(),
      color,
      diasSemana: [...dias].sort((a, b) => a - b),
      ejercicios: items.map(({ uid: _uid, ...e }, orden) => ({ ...e, orden })),
      creadaEn: creadaEn ?? ahora,
      actualizadaEn: ahora,
    })
    setSucio(false)
    navigate('/rutinas', { replace: true })
  }

  if (!cargado) return <PageHeader title="" back />

  return (
    <>
      <PageHeader
        title={id ? 'Editar rutina' : 'Nueva rutina'}
        subtitle={items.length ? `${items.length} ejercicios · ${series} series` : undefined}
        back
        onBack={() => !sucio || confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')}
      />
      <main className="max-w-lg mx-auto px-4 py-4 pb-28 space-y-5">
        <div>
          <label htmlFor="nombre" className="block text-sm font-semibold mb-2">Nombre</label>
          <input
            id="nombre"
            value={nombre}
            onChange={(e) => marcar(setNombre)(e.target.value)}
            placeholder="Ej.: Empuje, Pierna, Torso A…"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Días de la semana</p>
          <DiasSemana dias={dias} onChange={marcar(setDias)} color={color} />
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Color</p>
          <div className="flex gap-3">
            {COLORES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                onClick={() => marcar(setColor)(c)}
                className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Ejercicios</p>
            {items.length > 1 && <p className="text-xs text-gray-500">Arrastra ⋮⋮ para reordenar</p>}
          </div>
          <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={alSoltar}>
            <SortableContext items={items.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {items.map((item) => (
                  <FilaEjercicio
                    key={item.uid}
                    item={item}
                    ejercicio={ejercicios?.get(item.ejercicioId)}
                    unidad={unidad}
                    onChange={(cambios) => {
                      setItems((l) => l.map((i) => (i.uid === item.uid ? { ...i, ...cambios } : i)))
                      setSucio(true)
                    }}
                    onQuitar={() => {
                      setItems((l) => l.filter((i) => i.uid !== item.uid))
                      setSucio(true)
                    }}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          <Button
            variant="secondary"
            fullWidth
            className="mt-3 flex items-center justify-center gap-2 border border-dashed border-gray-600"
            onClick={() => setSelector(true)}
          >
            <Plus size={18} /> Añadir ejercicios
          </Button>
        </div>
      </main>

      <div
        className="fixed left-0 right-0 z-40 px-4 pb-3 pointer-events-none"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-lg mx-auto pointer-events-auto">
          <Button size="lg" fullWidth onClick={guardar} disabled={!nombre.trim()} className="shadow-xl">
            {nombre.trim() ? 'Guardar rutina' : 'Ponle un nombre para guardar'}
          </Button>
        </div>
      </div>

      {selector && <SelectorEjercicios onCerrar={() => setSelector(false)} onAnadir={anadir} />}
    </>
  )
}
