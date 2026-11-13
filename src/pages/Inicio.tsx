import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { Play, CalendarOff, Footprints, Scale } from 'lucide-react'
import { db } from '../db'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { fechaLarga, claveDia } from '../lib/fechas'

export function Inicio() {
  const hoy = new Date().getDay()
  const rutinasHoy = useLiveQuery(
    () => db.rutinas.filter((r) => r.diasSemana.includes(hoy)).toArray(),
    [hoy]
  )
  const pasosHoy = useLiveQuery(() => db.pasos.get(claveDia()))
  const ultimoPeso = useLiveQuery(() => db.pesoCorporal.orderBy('fecha').last())
  const ajustes = useLiveQuery(() => db.ajustes.get(1))

  const fecha = fechaLarga()

  return (
    <>
      <PageHeader title="Hoy" subtitle={fecha.charAt(0).toUpperCase() + fecha.slice(1)} />
      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {rutinasHoy === undefined ? null : rutinasHoy.length === 0 ? (
          <Card className="text-center py-8">
            <CalendarOff className="mx-auto text-gray-500 mb-3" size={40} />
            <p className="text-gray-300 font-semibold">Hoy no tienes rutina asignada</p>
            <p className="text-gray-500 text-sm mt-1">Día de descanso, o crea una rutina para hoy.</p>
            <Link to="/rutinas">
              <Button variant="secondary" className="mt-4">Ir a Rutinas</Button>
            </Link>
          </Card>
        ) : (
          rutinasHoy.map((r) => (
            <Card key={r.id} style={{ borderLeft: `4px solid ${r.color}` }}>
              <p className="text-xs uppercase tracking-wide text-gray-400">Rutina de hoy</p>
              <h2 className="text-xl font-bold mt-1">{r.nombre}</h2>
              <p className="text-sm text-gray-400 mt-1">{r.ejercicios.length} ejercicios</p>
              <Button size="lg" fullWidth className="mt-4 flex items-center justify-center gap-2" disabled>
                <Play size={20} /> Empezar entrenamiento
              </Button>
            </Card>
          ))
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <Footprints className="text-emerald-400" size={22} />
            <p className="text-2xl font-bold mt-2">{pasosHoy?.pasos.toLocaleString('es-ES') ?? '—'}</p>
            <p className="text-xs text-gray-400">
              pasos · objetivo {ajustes?.objetivoPasos.toLocaleString('es-ES') ?? '—'}
            </p>
          </Card>
          <Card>
            <Scale className="text-sky-400" size={22} />
            <p className="text-2xl font-bold mt-2">
              {ultimoPeso ? `${ultimoPeso.pesoKg.toFixed(1)}` : '—'}
            </p>
            <p className="text-xs text-gray-400">kg · último registro</p>
          </Card>
        </div>
      </main>
    </>
  )
}
