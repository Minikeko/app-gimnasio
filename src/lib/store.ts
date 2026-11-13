import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SesionActiva, Ajustes } from '../types'

interface AppStore {
  sesionActiva: SesionActiva | null
  ajustes: Ajustes | null
  setSesionActiva: (s: SesionActiva | null) => void
  setAjustes: (a: Ajustes) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      sesionActiva: null,
      ajustes: null,
      setSesionActiva: (s) => set({ sesionActiva: s }),
      setAjustes: (a) => set({ ajustes: a }),
    }),
    {
      name: 'gym-tracker-store',
      partialize: (state) => ({ sesionActiva: state.sesionActiva }),
    }
  )
)
