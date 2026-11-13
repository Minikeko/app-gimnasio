import { NavLink } from 'react-router-dom'
import { Home, ListChecks, Dumbbell, TrendingUp, Settings } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: 'Hoy' },
  { to: '/rutinas', icon: ListChecks, label: 'Rutinas' },
  { to: '/ejercicios', icon: Dumbbell, label: 'Ejercicios' },
  { to: '/progreso', icon: TrendingUp, label: 'Progreso' },
  { to: '/ajustes', icon: Settings, label: 'Ajustes' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-xl transition-colors ${
                isActive
                  ? 'text-indigo-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            <Icon size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
