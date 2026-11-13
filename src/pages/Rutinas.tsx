import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Copy, ListChecks, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { db } from '../db'
import type { Rutina } from '../types'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { DiasSemana } from '../components/rutina/DiasSemana'

export function Rutinas() {
  const navigate = useNavigate()
  const rutinas = useLiveQuery(() => db.rutinas.orderBy('creadaEn').toArray())
  const [menu, setMenu] = useState<string | null>(null)

  async function duplicar(r: Rutina) {
    setMenu(null)
    const ahora = new Date()
    await db.rutinas.add({
      ...structuredClone(r),
      id: crypto.randomUUID(),
      nombre: `${r.nombre} (copia)`,
      diasSemana: [],
      creadaEn: ahora,
      actualizadaEn: ahora,
    })
  }

  async function borrar(r: Rutina) {
    setMenu(null)
    if (confirm(`¿Borrar la rutina "${r.nombre}"? El historial de sesiones se conserva.`)) {
      await db.rutinas.delete(r.id)
    }
  }

  return (
    <>
      <PageHeader
        title="Rutinas"
        action={
          <Link to="/rutinas/nueva" className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-semibold px-3 py-2 rounded-xl">
            <Plus size={18} /> Nueva
          </Link>
        }
      />
      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {rutinas?.length === 0 && (
          <Card className="text-center py-10">
            <ListChecks className="mx-auto text-gray-500 mb-3" size={40} />
            <p className="font-semibold">Aún no tienes rutinas</p>
            <p className="text-sm text-gray-400 mt-1">Crea tu primera tabla y asígnale los días de la semana.</p>
            <Button className="mt-4" onClick={() => navigate('/rutinas/nueva')}>Crear rutina</Button>
          </Card>
        )}

        {rutinas?.map((r) => (
          <div key={r.id} className="relative">
            <Link
              to={`/rutinas/${r.id}`}
              className="block bg-gray-800 border border-gray-700 rounded-2xl p-4 pr-12 active:bg-gray-700"
              style={{ borderLeft: `4px solid ${r.color}` }}
            >
              <h2 className="font-bold text-lg leading-tight">{r.nombre}</h2>
              <p className="text-sm text-gray-400 mt-1 mb-3">
                {r.ejercicios.length} {r.ejercicios.length === 1 ? 'ejercicio' : 'ejercicios'} ·{' '}
                {r.ejercicios.reduce((n, e) => n + e.series, 0)} series
              </p>
              <DiasSemana dias={r.diasSemana} color={r.color} />
            </Link>
            <button
              onClick={() => setMenu(menu === r.id ? null : r.id)}
              aria-label="Opciones"
              className="absolute top-3 right-2 p-2 text-gray-400"
            >
              <MoreVertical size={20} />
            </button>
            {menu === r.id && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />
                <div className="absolute right-2 top-12 z-50 w-44 bg-gray-700 border border-gray-600 rounded-xl shadow-xl overflow-hidden">
                  <button onClick={() => navigate(`/rutinas/${r.id}`)} className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-gray-600">
                    <Pencil size={16} /> Editar
                  </button>
                  <button onClick={() => duplicar(r)} className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-gray-600">
                    <Copy size={16} /> Duplicar
                  </button>
                  <button onClick={() => borrar(r)} className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-gray-600">
                    <Trash2 size={16} /> Borrar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </main>
    </>
  )
}
