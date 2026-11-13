import { HashRouter, Routes, Route } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { Rutinas } from './pages/Rutinas'
import { RutinaEditor } from './pages/RutinaEditor'
import { BottomNav } from './components/layout/BottomNav'
import { Inicio } from './pages/Inicio'
import { Ajustes } from './pages/Ajustes'
import { Ejercicios } from './pages/Ejercicios'
import { EjercicioDetalle } from './pages/EjercicioDetalle'
import { EjercicioForm } from './pages/EjercicioForm'
import { Placeholder } from './pages/Placeholder'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-dvh pb-20">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/rutinas" element={<Rutinas />} />
          <Route path="/rutinas/nueva" element={<RutinaEditor />} />
          <Route path="/rutinas/:id" element={<RutinaEditor />} />
          <Route path="/ejercicios" element={<Ejercicios />} />
          <Route path="/ejercicios/nuevo" element={<EjercicioForm />} />
          <Route path="/ejercicios/:id" element={<EjercicioDetalle />} />
          <Route path="/ejercicios/:id/editar" element={<EjercicioForm />} />
          <Route
            path="/progreso"
            element={<Placeholder titulo="Progreso" icono={<TrendingUp size={40} />} texto="Récords, peso, pasos y mapa corporal (Fases 5-7)." />}
          />
          <Route path="/ajustes" element={<Ajustes />} />
        </Routes>
      </div>
      <BottomNav />
    </HashRouter>
  )
}
